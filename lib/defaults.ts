import { NextRouter } from 'next/router'
import { findAssetByHash, findAssetByTicker } from './assets'
import { NetworkNames } from './constants'
import { CoinPair } from './types'

export const defaultNetwork = NetworkNames.TESTNET

/**
 * Default destination asset (L-BTC)
 * @param network NetworkNames
 * @returns Asset
 */
const defaultDestAsset = (network: NetworkNames) =>
  findAssetByTicker('L-BTC', network)

/**
 * Default from asset (FUJI)
 * @param network NetworkNames
 * @returns Asset
 */
const defaultFromAsset = (network: NetworkNames) =>
  findAssetByTicker('FUJI', network)

/**
 * Get default pair
 * if param asset_p was passed on the URL, use it to define the from asset
 * @param router NextRouter
 * @param network NetworkNames
 * @returns CoinPair
 */
export const getDefaultPair = (
  router: NextRouter,
  network = defaultNetwork,
): CoinPair => {
  // default coins
  let dest = defaultDestAsset(network)
  let from = defaultFromAsset(network)
  // check if asset_p was passed as URL param
  const { asset_p } = router.query
  if (typeof asset_p === 'string') {
    try {
      const asset = findAssetByHash(asset_p, network)
      if (asset) {
        // make asset the default from coin
        from = asset
        // if both assets are the same, change destination coin
        if (from.assetHash === dest.assetHash) dest = defaultFromAsset(network)
      }
    } catch (ignore) {}
  }
  return { dest, from }
}
