import axios from 'axios'
import {
  CoinPair,
  TDEXMarket,
  TDEXTradePreview,
  TDEXTradeType,
  isTDEXTradePreviewResponse,
} from 'lib/types'

export async function fetchTradePreview(
  amount = '0',
  market: TDEXMarket,
  pair: CoinPair,
  type: TDEXTradeType,
) {
  const trade: TDEXTradePreview = {
    amount,
    asset: pair.from.assetHash,
    feeAsset: pair.from.assetHash,
    market,
    type,
  }
  const url = market.provider.endpoint + '/v2/trade/preview'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (await axios.post(url, trade, opt)).data.previews
  if (!Array.isArray(res)) throw new Error('Invalid trade/preview response')
  return res.filter(isTDEXTradePreviewResponse)
}
