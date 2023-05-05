import CoinInput from './input'
import { useContext, useEffect, useState } from 'react'
import { Coin, CoinPair, TDEXMarket, TDEXTradeType } from '../../lib/types'
import Arrow from './arrow'
import TradeButton from './button'
import { TradeButtonStatus } from 'lib/constants'
import { WalletContext } from 'providers/wallet'
import { openModal, sleep, toSatoshis } from 'lib/utils'
import Decimal from 'decimal.js'
import { TradeContext } from 'providers/trade'
import AssetListModal from 'components/modals/assetList'
import { ModalIds } from 'components/modals/modal'
import { getBestMarket } from 'lib/tdex/market'
import { defaultDestAsset, defaultFromAsset } from 'lib/defaults'
import TradeModal from 'components/modals/trade'
import { TradeStatus } from 'lib/constants'
import { getCoins } from 'lib/marina'
import { selectCoins } from 'lib/coinSelection'
import { fetchTradePreview } from 'lib/tdex/trade'
import { showToast } from 'lib/toast'

export default function Trade() {
  const { connected, enoughBalanceOnMarina, network } =
    useContext(WalletContext)
  const { loading, markets } = useContext(TradeContext)

  const [marketBalanceError, setMarketBalanceError] = useState(false)
  const [marinaBalanceError, setMarinaBalanceError] = useState(false)
  const [errorPreview, setErrorPreview] = useState(false)
  const [market, setMarket] = useState<TDEXMarket>()
  const [side, setSide] = useState('from')
  const [tradeError, setTradeError] = useState<string>()
  const [tradeStatus, setTradeStatus] = useState(TradeStatus.WAITING)
  const [txid, setTxid] = useState<string>()

  // default pair
  const [pair, setPair] = useState<CoinPair>({
    dest: defaultDestAsset(network),
    from: defaultFromAsset(network),
  })

  // update pair on network change
  useEffect(() => {
    if (network) {
      const pair = {
        dest: defaultDestAsset(network),
        from: defaultFromAsset(network),
      }
      setPair(pair)
    }
  }, [network])

  // update best market on changes
  useEffect(() => {
    setMarket(getBestMarket(markets, pair))
    console.log(getBestMarket(markets, pair))
  }, [markets, pair])

  // update balance errors
  useEffect(() => {
    if (market) {
      const { amount, assetHash, precision } = pair.from
      const sats = toSatoshis(amount, precision)
      setMarinaBalanceError(!enoughBalanceOnMarina(assetHash, sats))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, pair])

  // invert pairs on arrow click
  const invertPair = () => {
    setPair({
      from: pair.dest,
      dest: pair.from,
    })
  }

  // called to change dest asset, puts from amount undefined
  const setDestAsset = (asset: Coin) => {
    setPair({
      dest: asset,
      from: { ...pair.from, amount: undefined },
    })
  }

  // called to change from asset, puts dest amount undefined
  const setFromAsset = (asset: Coin) => {
    setPair({
      dest: { ...pair.dest, amount: undefined },
      from: asset,
    })
  }

  const setDestAmount = async (destAmount?: number) => {
    if (!market) return
    if (!destAmount) {
      setPair({
        dest: { ...pair.dest, amount: destAmount },
        from: { ...pair.from, amount: destAmount },
      })
    } else {
      const preview = await fetchTradePreview(
        destAmount,
        market,
        pair,
        pair.dest,
      )
      console.log('preview', preview[0])
      const { amount, feeAmount } = preview[0]

      const fromAmount = Decimal.add(
        Number(amount),
        Number(feeAmount),
      ).toNumber()

      console.log('fromAmount', fromAmount)
      console.log('destAmount', destAmount)

      setPair({
        dest: { ...pair.dest, amount: destAmount },
        from: { ...pair.from, amount: fromAmount },
      })
    }
  }

  const setFromAmount = async (fromAmount?: number) => {
    if (!market) return
    if (!fromAmount) {
      setPair({
        dest: { ...pair.dest, amount: fromAmount },
        from: { ...pair.from, amount: fromAmount },
      })
    } else {
      const preview = await fetchTradePreview(
        fromAmount,
        market,
        pair,
        pair.from,
      )
      console.log('preview', preview[0])
      const { amount, feeAmount } = preview[0]

      const destAmount = Decimal.sub(
        Number(amount),
        Number(feeAmount),
      ).toNumber()

      console.log('fromAmount', fromAmount)
      console.log('destAmount', destAmount)

      setPair({
        dest: { ...pair.dest, amount: destAmount },
        from: { ...pair.from, amount: fromAmount },
      })
    }
  }

  const openAssetsModal = (side: string) => {
    setSide(side)
    openModal(ModalIds.AssetsList)
  }

  const onTrade = async () => {
    try {
      if (!market) throw 'unknown market error'

      const { amount, assetHash, precision } = pair.from

      // fecth a preview of this trade
      const preview = await fetchTradePreview(
        toSatoshis(amount, precision),
        market,
        pair,
        pair.from,
      )
      if (!preview?.[0]) throw 'unknown preview error'

      // calculate total amount to send
      const amountToSend = Decimal.add(
        Number(preview[0].amount),
        Number(preview[0].feeAmount),
      ).toNumber()

      // select utxos for trade
      const utxos = selectCoins(await getCoins(), assetHash, amountToSend)
      console.log('utxos', utxos)

      openModal(ModalIds.Trade)
      await sleep(2000)
      setTradeStatus(TradeStatus.COMPLETED)
    } catch (err) {
      const errMsg = (err as Error).message
      showToast(errMsg)
      console.error(err)
      setTradeStatus(TradeStatus.ERROR)
      setTradeError(errMsg)
    }
  }

  // manage button status and message
  const tradeButtonStatus = !connected
    ? TradeButtonStatus.ConnectWallet
    : !market
    ? TradeButtonStatus.InvalidPair
    : errorPreview
    ? TradeButtonStatus.ErrorPreview
    : marinaBalanceError
    ? TradeButtonStatus.NoBalance
    : !pair.from.amount
    ? TradeButtonStatus.EnterAmount
    : TradeButtonStatus.Trade

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
                status={tradeButtonStatus}
              />
            </form>
            {network && <p className="is-size-7">Network: {network}</p>}
            {market && (
              <p className="is-size-7">
                Provider:{' '}
                <a href={market.provider.endpoint}>
                  {market.provider.endpoint}
                </a>
              </p>
            )}
          </div>
        </div>
        <AssetListModal
          setDestAsset={setDestAsset}
          setFromAsset={setFromAsset}
          side={side}
        />
        <TradeModal
          error={tradeError}
          pair={pair}
          status={tradeStatus}
          txid={txid}
        />
      </div>
    </div>
  )
}
