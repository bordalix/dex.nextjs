import Decimal from 'decimal.js'
import { NetworkNames } from './constants'
import {
  CoinPair,
  TDEXMarket,
  TDEXMarketBalance,
  TDEXMarketPrice,
  TDEXProvider,
  TDEXTradeType,
  isTDEXMarket,
  isTDEXMarketBalance,
  isTDEXMarketPrice,
  isTDEXProvider,
} from './types'
import axios from 'axios'
import { toSatoshis } from './utils'

/**
 * Get tdex registry url based on network selected on Marina
 * @param network network name
 * @returns url
 */
export function getRegistryURL(network: NetworkNames): string {
  const Registries = {
    [NetworkNames.MAINNET]:
      'https://raw.githubusercontent.com/tdex-network/tdex-registry/master/registry.json',
    [NetworkNames.TESTNET]:
      'https://raw.githubusercontent.com/tdex-network/tdex-registry/testnet/registry.json',
  }
  return Registries[network] || Registries[NetworkNames.MAINNET]
}

/**
 * Get a list of registered providers from TDEX_REGISTRY_URL
 * @param network network name
 * @returns a list of providers
 */
export async function getProvidersFromRegistry(
  network: NetworkNames = NetworkNames.MAINNET,
): Promise<TDEXProvider[]> {
  // TODO: remove this after registry is updated
  if (network === NetworkNames.TESTNET) {
    return [
      {
        name: 'v1.provider.tdex.network',
        endpoint: 'https://v1.provider.tdex.network',
      },
    ]
  }
  // end of TODO
  const res = (await axios.get(getRegistryURL(network))).data
  if (!Array.isArray(res)) throw new Error('Invalid registry response')
  return res.filter(isTDEXProvider)
}

/**
 * Get a list of markets from a given provider
 * @param provider
 * @returns an array of markets
 */
export async function getMarketsFromProvider(
  provider: TDEXProvider,
): Promise<TDEXMarket[]> {
  const url = provider.endpoint + '/v2/markets'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (await axios.post(url, {}, opt)).data.markets
  if (!Array.isArray(res)) throw new Error('Invalid markets response')
  return res
    .map((m: any) => ({
      provider,
      baseAsset: m.market.baseAsset,
      quoteAsset: m.market.quoteAsset,
      percentageFee: m.fee.percentageFee,
      fixedFee: m.fee.fixedFee,
    }))
    .filter(isTDEXMarket)
}

/**
 * Get the price for a given market
 * @param market
 * @returns an array of markets
 */
export async function getMarketPrice(
  market: TDEXMarket,
): Promise<TDEXMarketPrice | undefined> {
  const url = market.provider.endpoint + '/v2/market/price'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (await axios.post(url, { market }, opt)).data
  return isTDEXMarketPrice(res) ? res : undefined
}

/**
 * Get the balance for a given market
 * @param market
 * @returns an array of markets
 */
export async function getMarketBalance(
  market: TDEXMarket,
): Promise<TDEXMarketBalance | undefined> {
  const url = market.provider.endpoint + '/v2/market/balance'
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = (await axios.post(url, { market }, opt)).data.balance
  return isTDEXMarketBalance(res) ? res : undefined
}

/**
 * Calculate total fees in a given market for a given pair
 * Note: percentageFee is represented in basis points (10^-4)
 * @param market
 * @param pair
 * @returns number
 */
function totalMarketFees(
  market: TDEXMarket,
  pair: CoinPair,
): number | undefined {
  // return undefined if market has no price
  if (typeof market.fixedFee === 'undefined') return
  if (typeof market.percentageFee === 'undefined') return

  // calculate fees
  const fixedFees = Decimal.add(
    market.fixedFee.baseAsset,
    market.fixedFee.quoteAsset,
  )
  const percentageFees = {
    dest: Decimal.mul(
      pair.dest.amount ?? 0,
      market.percentageFee.quoteAsset,
    ).div(10_000),
    from: Decimal.mul(
      pair.from.amount ?? 0,
      market.percentageFee.baseAsset,
    ).div(10_000),
  }

  return Decimal.add(percentageFees.dest, percentageFees.from)
    .add(fixedFees)
    .toNumber()
}

/**
 * Find the best market for a given pair
 * @param markets
 * @param pair
 * @returns market
 */
export function getBestMarket(
  markets: TDEXMarket[],
  pair: CoinPair,
): TDEXMarket | undefined {
  const validMarkets = markets
    // find markets for this pair
    .filter(
      (market) =>
        (market.baseAsset === pair.from.assetHash &&
          market.quoteAsset === pair.dest.assetHash) ||
        (market.baseAsset === pair.dest.assetHash &&
          market.quoteAsset === pair.from.assetHash),
    )

  if (!validMarkets) return
  if (validMarkets.length === 1) return validMarkets[0]

  // if we reach this point, it means we have several matching markets,
  // so lets filter markets with enough balance
  const marketsWithEnoughBalance = validMarkets.filter((market) =>
    getTradeType(market, pair) === TDEXTradeType.SELL
      ? // buying quote asset, check quote asset market balance
        Number(market.balance?.quoteAmount) >= toSatoshis(pair.dest.amount)
      : // buying base asset, check base asset market balance
        Number(market.balance?.baseAmount) >= toSatoshis(pair.from.amount),
  )

  // if there's only one market left, return it
  if (marketsWithEnoughBalance.length === 1) return marketsWithEnoughBalance[0]

  // we want to return a market if there's no market with enough balance
  const multipleMarkets =
    marketsWithEnoughBalance.length === 0
      ? validMarkets
      : marketsWithEnoughBalance

  // if we reach this point, it means we have several matching markets,
  // so lets find the market with the best spot price
  const bestMarket = multipleMarkets.reduce((prev, curr) => {
    const prevSpotPrice = prev.price?.spotPrice ?? 0
    const currSpotPrice = curr.price?.spotPrice ?? 0
    return getTradeType(curr, pair) === TDEXTradeType.SELL
      ? // when selling base asset we want the lowest spot price
        prevSpotPrice < currSpotPrice
        ? prev
        : curr
      : // when buying base asset we want the highest spot price
      prevSpotPrice > currSpotPrice
      ? prev
      : curr
  }, validMarkets[0])

  // check if there are more then one market with same spot price
  // in that case, return the market with lowest fee
  const dups = validMarkets.filter(
    (m) => m.price?.spotPrice === bestMarket.price?.spotPrice,
  )
  if (dups.length > 1) {
    return dups.reduce((prev, curr) => {
      const prevFees = totalMarketFees(prev, pair)
      const currFees = totalMarketFees(curr, pair)
      if (!prevFees) return curr
      if (!currFees) return prev
      return prevFees < currFees ? prev : curr
    }, dups[0])
  }

  return bestMarket
}

/**
 * Get trade type (SELL or BUY)
 * @param market
 * @param pair
 * @returns trade type
 */
export function getTradeType(
  market: TDEXMarket,
  pair: CoinPair,
): TDEXTradeType {
  return market.baseAsset === pair.from.assetHash
    ? TDEXTradeType.SELL
    : TDEXTradeType.BUY
}

/**
 * Checks if a market has enough balance for a pair
 * @param market
 * @param pair
 * @returns boolean
 */
export function enoughBalanceOnMarket(
  market: TDEXMarket,
  pair: CoinPair,
): boolean {
  return getTradeType(market, pair) === TDEXTradeType.SELL
    ? // buying quote asset, check quote asset market balance
      Number(market.balance?.quoteAmount) >= toSatoshis(pair.dest.amount)
    : // buying base asset, check base asset market balance
      Number(market.balance?.baseAmount) >= toSatoshis(pair.dest.amount)
}
