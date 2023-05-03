import { Balance, MarinaProvider, NetworkString } from 'marina-provider'
import { ReactNode, createContext, useEffect, useState } from 'react'
import { NetworkNames } from '../lib/constants'
import { getBalances, getMarinaProvider, getNetwork } from '../lib/marina'
import { toSatoshis } from 'lib/utils'
import { Coin } from 'lib/types'
import { defaultNetwork } from 'lib/defaults'

interface WalletContextProps {
  connected: boolean
  enoughBalanceOnMarina: (hash: string, amount?: number) => boolean
  marina: MarinaProvider | undefined
  network: NetworkNames
  setConnected: (arg0: boolean) => void
}

export const WalletContext = createContext<WalletContextProps>({
  connected: false,
  enoughBalanceOnMarina: () => false,
  marina: undefined,
  network: defaultNetwork,
  setConnected: () => {},
})

interface WalletProviderProps {
  children: ReactNode
}
export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [balances, setBalances] = useState<Balance[]>([])
  const [connected, setConnected] = useState(false)
  const [marina, setMarina] = useState<MarinaProvider>()
  const [network, setNetwork] = useState<NetworkString>(defaultNetwork)

  const updateBalances = async () => setBalances(await getBalances())
  const updateNetwork = async () => setNetwork(await getNetwork())

  // get marina provider
  useEffect(() => {
    getMarinaProvider().then((payload) => setMarina(payload))
  })

  // update connected state
  useEffect(() => {
    if (marina) {
      marina.isEnabled().then((enabled) => setConnected(enabled))
    } else {
      setConnected(false)
    }
  }, [marina])

  // add event listeners for enable and disable (aka connected)
  useEffect(() => {
    if (marina) {
      const onDisabledId = marina.on('DISABLED', ({ data }) => {
        if (data.network === network) setConnected(false)
      })
      const onEnabledId = marina.on('ENABLED', ({ data }) => {
        if (data.network === network) setConnected(true)
      })
      return () => {
        marina.off(onDisabledId)
        marina.off(onEnabledId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marina])

  // update network and add event listener
  useEffect(() => {
    if (connected && marina) {
      updateNetwork()
      const id = marina.on('NETWORK', () => updateNetwork())
      return () => marina.off(id)
    }
  }, [connected, marina])

  // update balances and add event listener
  useEffect(() => {
    // marina can take up to 10 seconds to update balances
    // so web update balances now and on 10 seconds in the future
    const updateNowAndLater = () => {
      updateBalances()
      setTimeout(updateBalances, 10_000)
    }
    // add event listeners
    if (connected && marina) {
      marina.isEnabled().then((enabled) => {
        if (enabled) {
          updateBalances()
          const onSpentUtxoId = marina.on('SPENT_UTXO', updateNowAndLater)
          const onNewUtxoId = marina.on('NEW_UTXO', updateNowAndLater)
          return () => {
            marina.off(onSpentUtxoId)
            marina.off(onNewUtxoId)
          }
        }
      })
    }
  }, [connected, marina, network])

  // checks if there's enough balance for an asset
  const enoughBalanceOnMarina = (hash: string, amount = 0): boolean => {
    const balance = balances.find(({ asset }) => asset.assetHash === hash)
    return Boolean(balance && balance.amount >= amount)
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        enoughBalanceOnMarina,
        marina,
        network: network as NetworkNames,
        setConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
