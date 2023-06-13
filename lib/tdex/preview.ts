import axios from 'axios'
import {
  Coin,
  CoinPair,
  TDEXv2Market,
  TDEXv2PreviewTradeRequest,
  isTDEXv2PreviewTradeResponse,
} from 'lib/types'
import { getTradeType } from './market'

/**
 * Get a list of markets from a given provider
 * @param amount number
 * @param coin  Coin
 * @param market TDEXv2Market
 * @param pair CoinPair
 * @returns an array of markets
 */
export async function fetchTradePreview(
  amount: number,
  coin: Coin,
  market: TDEXv2Market,
  pair: CoinPair,
) {
  const { dest, from } = pair
  const otherCoin = coin.assetHash === from.assetHash ? dest : from
  const type = getTradeType(market, pair)
  const trade: TDEXv2PreviewTradeRequest = {
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
  return res.filter(isTDEXv2PreviewTradeResponse)
}
