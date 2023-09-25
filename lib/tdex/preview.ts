import axios from 'axios'
import {
  Coin,
  CoinPair,
  TDEXv2Market,
  TDEXv2PreviewTradeRequest,
  TDEXv2PreviewTradeResponse,
  isTDEXv2PreviewTradeResponse,
} from 'lib/types'
import { getTradeType } from './market'
import { TradeStatusMessage } from 'lib/constants'

/**
 * Returns an array of trade previews
 * @param amount number
 * @param coin  Coin
 * @param market TDEXv2Market
 * @param pair CoinPair
 * @returns an array of trade previews
 */
const fetchTradePreviews = async (
  amount: number,
  coin: Coin,
  market: TDEXv2Market,
  pair: CoinPair,
): Promise<TDEXv2PreviewTradeResponse[]> => {
  console.debug('fetchTradePreview', amount, coin, market, pair)
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

/**
 * Get a trade preview
 * @param amount number
 * @param coin  Coin
 * @param market TDEXv2Market
 * @param pair CoinPair
 * @returns a trade preview
 */
export const tradePreview = async (
  amount: number,
  coin: Coin,
  market: TDEXv2Market,
  pair: CoinPair,
): Promise<TDEXv2PreviewTradeResponse> => {
  try {
    console.debug('tradePreview', amount, coin, market, pair)
    const previews = await fetchTradePreviews(amount, coin, market, pair)
    if (!previews || !previews[0]) throw ''
    return previews[0]
  } catch (error: any) {
    console.error('error', error)
    throw error.response?.data?.code === 2
      ? TradeStatusMessage.AmountTooLarge
      : TradeStatusMessage.ErrorPreview
  }
}
