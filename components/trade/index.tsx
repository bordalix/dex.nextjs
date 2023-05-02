import CoinInput from './input'
import { useContext, useEffect, useState } from 'react'
import { Coin, CoinPair, TDEXMarket, TDEXTradeType } from '../../lib/types'
import Arrow from './arrow'
import TradeButton from './button'
import { TradeButtonStatus } from 'lib/constants'
import { WalletContext } from 'providers/wallet'
import { openModal, sleep, toSatoshis } from 'lib/utils'
import Decimal from 'decimal.js'
import { TradeContext } from 'providers/tdex'
import AssetListModal from 'components/modals/assetList'
import { ModalIds } from 'components/modals/modal'
import {
  enoughBalanceOnMarket,
  getBestMarket,
  getTradeType,
} from 'lib/tdex/market'
import { defaultDestAsset, defaultFromAsset } from 'lib/defaults'
import TradeModal from 'components/modals/trade'
import { TradeStatus } from 'lib/constants'
import { getCoins } from 'lib/marina'
import { selectCoins } from 'lib/coinSelection'
import { fetchTradePreview } from 'lib/tdex/trade'

export default function Trade() {
  const { connected, enoughBalanceOnMarina, network } =
    useContext(WalletContext)
  const { loading, markets } = useContext(TradeContext)

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
  }, [markets, pair])

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

  // called to set dest amount
  // calculates from amount and updates
  const setDestAmount = (amount: string) => {
    if (amount.match(/\.$/)) return
    if (!market || !market.price?.spotPrice) return
    const spotPrice = market.price.spotPrice
    if (amount === '') {
      setPair({
        dest: { ...pair.dest, amount: undefined },
        from: { ...pair.from, amount: undefined },
      })
    } else {
      if (isNaN(Number(amount))) return // avoid showing NaN on inputs
      const destAmount = Number(amount)
      const fromAmount =
        getTradeType(market, pair) === TDEXTradeType.SELL
          ? Decimal.div(destAmount, spotPrice).toNumber()
          : Decimal.mul(destAmount, spotPrice).toNumber()
      setPair({
        dest: { ...pair.dest, amount: destAmount },
        from: { ...pair.from, amount: fromAmount },
      })
    }
  }

  // called to set from amount
  // calculates dest amount and updates
  const setFromAmount = (amount: string) => {
    if (amount.match(/\.$/)) return
    if (!market || !market.price?.spotPrice) return
    const spotPrice = market.price.spotPrice
    if (amount === '') {
      setPair({
        dest: { ...pair.dest, amount: undefined },
        from: { ...pair.from, amount: undefined },
      })
    } else {
      if (isNaN(Number(amount))) return // avoid showing NaN on inputs
      const fromAmount = Number(amount)
      const destAmount =
        getTradeType(market, pair) === TDEXTradeType.SELL
          ? Decimal.mul(fromAmount, spotPrice).toNumber()
          : Decimal.div(fromAmount, spotPrice).toNumber()
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
      const { amount, assetHash, precision } = pair.from
      const amountToSend = toSatoshis(amount, precision)
      console.log(
        'coins',
        selectCoins(await getCoins(), assetHash, amountToSend),
      )
      if (market)
        fetchTradePreview(
          market,
          pair,
          getTradeType(market, pair),
          toSatoshis(pair.from.amount).toString(),
        )
      openModal(ModalIds.Trade)
      await sleep(2000)
      setTradeStatus(TradeStatus.COMPLETED)
    } catch (e) {
      console.error(e)
      setTradeStatus(TradeStatus.ERROR)
      setTradeError((e as Error).message)
    }
  }

  // manage button status and message
  const tradeButtonStatus = !connected
    ? TradeButtonStatus.ConnectWallet
    : !market
    ? TradeButtonStatus.InvalidPair
    : errorPreview
    ? TradeButtonStatus.ErrorPreview
    : !enoughBalanceOnMarket(market, pair)
    ? `Not enough ${pair.dest.ticker} on Market`
    : !enoughBalanceOnMarina(pair.from)
    ? `Not enough ${pair.from.ticker} on Marina`
    : !pair.from.amount
    ? TradeButtonStatus.EnterAmount
    : TradeButtonStatus.Trade

  return (
    <div className="hero-body">
      <div className="container is-max-desktop">
        <div className="columns">
          <div className="column is-half is-offset-one-quarter">
            <form className="box has-background-black">
              <h1 className="title has-text-white">Trade</h1>
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
