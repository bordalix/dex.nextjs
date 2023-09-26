import { Balance, MarinaProvider, NetworkString } from 'marina-provider'
import { ReactNode, createContext, useEffect, useState } from 'react'
import { NetworkNames } from '../lib/constants'
import {
  getBalances,
  getIsEnabled,
  getMarinaProvider,
  getNetwork,
} from '../lib/marina'
import { Coin } from 'lib/types'

interface WalletContextProps {
  connected: boolean
  enoughBalance: (coin: Coin) => boolean
  marina: MarinaProvider | undefined
  network: NetworkNames | undefined
  setConnected: (arg0: boolean) => void
}

export const WalletContext = createContext<WalletContextProps>({
  connected: false,
  enoughBalance: () => false,
  marina: undefined,
  network: undefined,
  setConnected: () => {},
})

interface WalletProviderProps {
  children: ReactNode
}
export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [balances, setBalances] = useState<Balance[]>([])
  const [connected, setConnected] = useState(false)
  const [marina, setMarina] = useState<MarinaProvider>()
  const [network, setNetwork] = useState<NetworkString>()

  console.log(
    'marina',
    typeof marina,
    'connect',
    connected,
    'network',
    network,
    'balances',
    balances,
  )

  // async utils
  const updateBalances = async () => setBalances(await getBalances())
  const updateConnected = async () => setConnected(await getIsEnabled())
  const updateMarina = async () => setMarina(await getMarinaProvider())
  const updateNetwork = async () => setNetwork(await getNetwork())

  // after emiting the new_ or spent_ utxo events marina
  // takes a couple of seconds to update the balances.
  const delayedBalancesUpdate = () => setTimeout(updateBalances, 2_000)

  // prevents weird reload bug
  setTimeout(() => updateConnected(), 1000)

  // get marina provider
  useEffect(() => {
    updateMarina()
  }, [])

  // update connected on marina
  useEffect(() => {
    if (marina) updateConnected()
  }, [marina])

  // add listeners for marina events
  // https://docs.vulpem.com/marina/api#marina-events
  useEffect(() => {
    if (!marina) return
    const onDisabledId = marina.on('DISABLED', () => setConnected(false))
    const onEnabledId = marina.on('ENABLED', () => setConnected(true))
    const onNetworkId = marina.on('NETWORK', ({ data }) => setNetwork(data))
    const onSpentUtxoId = marina.on('SPENT_UTXO', delayedBalancesUpdate)
    const onNewUtxoId = marina.on('NEW_UTXO', delayedBalancesUpdate)
    return () => {
      marina.off(onDisabledId)
      marina.off(onEnabledId)
      marina.off(onNetworkId)
      marina.off(onSpentUtxoId)
      marina.off(onNewUtxoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marina])

  // update network on connection
  useEffect(() => {
    if (connected) updateNetwork()
  }, [connected])

  // update balances on network change
  useEffect(() => {
    if (network) updateBalances()
  }, [network])

  // checks if there's enough balance for an asset
  const enoughBalance = (coin: Coin): boolean => {
    const { amount, assetHash } = coin
    if (!amount) return true
    const balance = balances.find(({ asset }) => asset.assetHash === assetHash)
    return Boolean(balance && balance.amount >= amount)
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        enoughBalance,
        marina,
        network: network as NetworkNames,
        setConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
