import axios from 'axios'
import {
  CoinPair,
  TDEXMarket,
  TDEXTradePreview,
  TDEXTradeType,
} from 'lib/types'

export async function fetchTradePreview(
  market: TDEXMarket,
  pair: CoinPair,
  type: TDEXTradeType,
  amount = '0',
) {
  const trade: TDEXTradePreview = { market, type, amount }
  const url = market.provider.endpoint + '/v2/trade/preview'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (
    await axios.post(url, { asset: pair.from.assetHash, market, trade }, opt)
  ).data
  console.log('res', res)
}
