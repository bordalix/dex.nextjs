import { type Asset } from 'marina-provider'

export type Coin = Asset & {
  amount?: number
  iconSrc: string
}

export interface CoinPair {
  from: Coin
  dest: Coin
}

export interface TDEXMarket {
  balance?: TDEXMarketBalance
  provider: TDEXProvider
  baseAsset: string
  baseAmount?: string
  quoteAsset: string
  quoteAmount?: string
  percentageFee?: { baseAsset: string; quoteAsset: string }
  fixedFee?: { baseAsset: string; quoteAsset: string }
  price?: TDEXMarketPrice
}

export function isTDEXMarket(market: any): market is TDEXMarket {
  return (
    typeof market === 'object' &&
    typeof market.baseAsset === 'string' &&
    typeof market.quoteAsset === 'string'
  )
}

export interface TDEXProvider {
  name: string
  endpoint: string
}

export function isTDEXProvider(provider: any): provider is TDEXProvider {
  return (
    typeof provider === 'object' &&
    typeof provider.name === 'string' &&
    typeof provider.endpoint === 'string'
  )
}

export interface TDEXMarketBalance {
  baseAmount: string
  quoteAmount: string
}

export function isTDEXMarketBalance(
  balance: any,
): balance is TDEXMarketBalance {
  return (
    typeof balance === 'object' &&
    typeof balance.baseAmount === 'string' &&
    typeof balance.quoteAmount === 'string'
  )
}

export interface TDEXMarketPrice {
  spotPrice: number
  minTradableAmount: string
}

export function isTDEXMarketPrice(price: any): price is TDEXMarketPrice {
  return (
    typeof price === 'object' &&
    typeof price.spotPrice === 'number' &&
    typeof price.minTradableAmount === 'string'
  )
}

export enum TDEXTradeType {
  BUY = 0,
  SELL = 1,
}
