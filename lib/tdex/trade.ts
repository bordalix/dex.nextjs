import axios from 'axios'
import {
  Coin,
  CoinPair,
  TDEXMarket,
  TDEXTradePreview,
  isTDEXTradePreviewResponse,
} from 'lib/types'
import { getTradeType } from './market'

interface TradePreviewProps {
  amount: number
  market: TDEXMarket
  pair: CoinPair
  coin: Coin
}

export async function fetchTradePreview({
  amount,
  market,
  pair,
  coin,
}: TradePreviewProps) {
  const { dest, from } = pair
  const otherCoin = coin.assetHash === from.assetHash ? dest : from
  const type = getTradeType(market, pair)
  const trade: TDEXTradePreview = {
    amount: amount.toString(),
    asset: coin.assetHash,
    feeAsset: otherCoin.assetHash,
    market,
    type,
  }
  const url = market.provider.endpoint + '/v2/trade/preview'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (await axios.post(url, trade, opt)).data.previews
  if (!Array.isArray(res)) throw new Error('Invalid trade/preview response')
  return res.filter(isTDEXTradePreviewResponse)
}
