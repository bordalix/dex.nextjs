import CoinInput from './input'
import { useContext, useEffect, useState } from 'react'
import { Coin, CoinPair, TDEXv2Market, TDEXv2Provider } from '../../lib/types'
import Arrow from './arrow'
import TradeButton from './button'
import { TradeStatusMessage } from 'lib/constants'
import { WalletContext } from 'providers/wallet'
import { closeModal, openModal } from 'lib/utils'
import { TradeContext } from 'providers/trade'
import AssetListModal from 'components/modals/assetList'
import { ModalIds } from 'components/modals/modal'
import { getBestMarket } from 'lib/tdex/market'
import { getDefaultPair } from 'lib/defaults'
import TradeModal from 'components/modals/trade'
import { TradeStatus } from 'lib/constants'
import { signTx } from 'lib/marina'
import { tradePreview } from 'lib/tdex/preview'
import { showToast } from 'lib/toast'
import { completeTrade, proposeTrade } from 'lib/tdex/trade'
import ProviderListModal from 'components/modals/providerList'
import { useRouter } from 'next/router'

export default function Trade() {
  const { connected, enoughBalance, network } = useContext(WalletContext)
  const { loading, markets, providers } = useContext(TradeContext)

  const [balanceError, setBalanceError] = useState(false)
  const [errorPreview, setErrorPreview] = useState(false)
  const [useProvider, setUseProvider] = useState<TDEXv2Provider | undefined>()
  const [market, setMarket] = useState<TDEXv2Market>()
  const [side, setSide] = useState('from')
  const [tradeError, setTradeError] = useState<string>()
  const [tradeStatus, setTradeStatus] = useState(TradeStatus.PROPOSING)
  const [txid, setTxid] = useState<string>()

  const router = useRouter()

  const [pair, setPair] = useState<CoinPair>(getDefaultPair(router, network))

  // update pair on network change
  useEffect(() => {
    if (network) setPair(getDefaultPair(router, network))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  // update best market on changes
  useEffect(() => {
    setMarket(getBestMarket(markets, pair, useProvider))
  }, [markets, pair, useProvider])

  // update balance errors
  useEffect(() => {
    if (market) {
      setBalanceError(!enoughBalance(pair.from))
    }
    setErrorPreview(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, pair])

  // invert pairs on arrow click
  const invertPair = () => {
    setPair({
      from: pair.dest,
      dest: pair.from,
    })
  }

  // change destination asset, puts from amount undefined
  const setDestAsset = (asset: Coin) => {
    setPair({
      dest: asset,
      from: { ...pair.from, amount: undefined },
    })
  }

  // change from asset, puts destination amount undefined
  const setFromAsset = (asset: Coin) => {
    setPair({
      dest: { ...pair.dest, amount: undefined },
      from: asset,
    })
  }

  // change amount for a given side ('from' or 'dest')
  // makes a trade preview to find the amount of the other coin
  const setAmount = async (which: string, amount?: number) => {
    try {
      // if it's an invalid pair, return
      if (!market) throw TradeStatusMessage.InvalidPair

      // if amount is undefined or zero, reset amounts
      if (!amount) {
        setPair({
          dest: { ...pair.dest, amount },
          from: { ...pair.from, amount },
        })
      } else {
        // make a preview to find out other coin amount
        const coin = which === 'dest' ? pair.dest : pair.from
        const preview = await tradePreview(amount, coin, market, pair)

        // calculate amount for the other coin
        const otherAmount = Number(preview.amount)

        // update pair with new amounts
        setPair(
          which === 'dest'
            ? {
                dest: { ...pair.dest, amount },
                from: { ...pair.from, amount: otherAmount },
              }
            : {
                dest: { ...pair.dest, amount: otherAmount },
                from: { ...pair.from, amount },
              },
        )
      }
    } catch (err) {
      setErrorPreview(true)
      showToast(err)
    }
  }

  // change amount for destination (aka buying) coin
  const setDestAmount = async (amount?: number) => setAmount('dest', amount)

  // change amount for from (aka selling) coin
  const setFromAmount = async (amount?: number) => setAmount('from', amount)

  // open modal to choose assets
  // variable side informs wich side clicked to open modal
  const openAssetsModal = (side: string) => {
    setSide(side)
    openModal(ModalIds.AssetList)
  }

  // when closing trade modal reset amounts and trade status
  const closeTradeModal = () => {
    setFromAmount()
    setTradeStatus(TradeStatus.PROPOSING)
    closeModal(ModalIds.Trade)
  }

  // when user clicks Trade button, advance with trade
  const onTrade = async () => {
    try {
      // if it's an invalid pair throw error
      if (!market) throw TradeStatusMessage.InvalidPair

      // if no amount, return
      if (!pair.from.amount) return

      // check balance
      if (!enoughBalance(pair.from)) throw TradeStatusMessage.NoBalance

      // open trade modal
      openModal(ModalIds.Trade)

      // propose trade
      setTradeStatus(TradeStatus.PROPOSING)
      const propose = await proposeTrade(market, pair)
      if (!propose.swapAccept) throw TradeStatusMessage.SwapNotAccepted

      // sign tx
      setTradeStatus(TradeStatus.CONFIRM)
      const signedTx = await signTx(propose.swapAccept.transaction)
      if (!signedTx) throw TradeStatusMessage.ErrorSigning

      // complete trade
      const completeResponse = await completeTrade(propose, market, signedTx)
      if (!completeResponse.txid) throw TradeStatusMessage.ErrorCompleting

      // set values and return
      setTxid(completeResponse.txid)
      setTradeStatus(TradeStatus.COMPLETED)
    } catch (err) {
      const errMsg = (err as Error).message
      showToast(err)
      console.error(err)
      setTradeStatus(TradeStatus.ERROR)
      setTradeError(errMsg)
    }
  }

  const provider = market?.provider ?? useProvider

  // manage button status and message
  const TradeButtonMessage = !connected
    ? TradeStatusMessage.ConnectWallet
    : !providers.length
    ? TradeStatusMessage.NoProviders
    : !market
    ? TradeStatusMessage.InvalidPair
    : errorPreview
    ? TradeStatusMessage.ErrorPreview
    : balanceError
    ? TradeStatusMessage.NoBalance
    : !pair.from.amount
    ? TradeStatusMessage.EnterAmount
    : !pair.dest.amount
    ? TradeStatusMessage.InvalidAmount
    : TradeStatusMessage.Trade

  return (
    <div className="hero-body">
      <div className="container is-max-desktop">
        <div className="columns">
          <div className="column is-half is-offset-one-quarter">
            <form className="box has-background-black">
              <h1 className="title has-text-white mb-1">Trade</h1>
              <CoinInput
                coin={pair.from}
                openAssetsModal={() => openAssetsModal('from')}
                setAmount={setFromAmount}
              />
              <Arrow onClick={invertPair} />
              <CoinInput
                coin={pair.dest}
                openAssetsModal={() => openAssetsModal('dest')}
                setAmount={setDestAmount}
              />
              <TradeButton
                loading={loading}
                onClick={onTrade}
                status={TradeButtonMessage}
              />
            </form>
            {connected && network && (
              <p className="is-size-7">Network: {network}</p>
            )}
            {connected && providers.length > 0 && (
              <div className="is-flex is-justify-content-space-between">
                <p className="is-size-7 is-ellipsis">
                  Provider:{' '}
                  <a href={provider?.endpoint}>{provider?.endpoint}</a>
                </p>
                <p
                  className="is-size-7 is-clickable is-action"
                  onClick={() => openModal(ModalIds.ProviderList)}
                >
                  Change
                </p>
              </div>
            )}
          </div>
        </div>
        <AssetListModal
          setDestAsset={setDestAsset}
          setFromAsset={setFromAsset}
          side={side}
        />
        <TradeModal
          close={closeTradeModal}
          error={tradeError}
          pair={pair}
          status={tradeStatus}
          txid={txid}
        />
        <ProviderListModal
          providers={providers}
          useProvider={useProvider}
          setUseProvider={setUseProvider}
        />
      </div>
    </div>
  )
}
