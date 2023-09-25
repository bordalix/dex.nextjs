import { Coin } from './types'
import { NetworkNames } from './constants'
import { defaultNetwork } from './defaults'

// Note: Coin is an Asset with imgSrc and not mandatory amount
interface IAssetHash {
  [network: string]: string
}

export enum AssetTickers {
  FUSD = 'FUSD',
  LBTC = 'LBTC',
  LCAD = 'LCAD',
  LEAF = 'LEAF',
  USDT = 'USDT',
}

// id (aka hash) for assets across different networks
const AssetHashes: Record<string, IAssetHash> = {
  [AssetTickers.FUSD]: {
    [NetworkNames.TESTNET]:
      '0d86b2f6a8c3b02a8c7c8836b83a081e68b7e2b4bcdfc58981fc5486f59f7518',
    [NetworkNames.MAINNET]:
      '0dea022a8a25abb128b42b0f8e98532bc8bd74f8a77dc81251afcc13168acef7',
  },
  [AssetTickers.LBTC]: {
    [NetworkNames.MAINNET]:
      '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    [NetworkNames.TESTNET]:
      '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
  },
  [AssetTickers.LCAD]: {
    [NetworkNames.MAINNET]:
      '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    [NetworkNames.TESTNET]:
      'ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926',
  },
  [AssetTickers.LEAF]: {
    [NetworkNames.MAINNET]:
      '399c110cfb2ae53e91bacedad366522276ce7be4b3a7e5859f274bf9247d1704',
  },
  [AssetTickers.USDT]: {
    [NetworkNames.MAINNET]:
      'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    [NetworkNames.TESTNET]:
      'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958',
  },
}

// common characteristics for a coin across different networks
const ProtoAssets: Omit<Coin, 'assetHash'>[] = [
  {
    iconSrc: '/images/assets/fusd.svg',
    name: 'Fuji USD',
    precision: 8,
    ticker: AssetTickers.FUSD,
  },
  {
    iconSrc: '/images/assets/lbtc.svg',
    name: 'Liquid Bitcoin',
    precision: 8,
    ticker: AssetTickers.LBTC,
  },
  {
    iconSrc: '/images/assets/lcad.png',
    name: 'Liquid CAD',
    precision: 8,
    ticker: AssetTickers.LCAD,
  },
  {
    iconSrc: '/images/assets/leaf.png',
    name: 'Leaf Token',
    precision: 8,
    ticker: AssetTickers.LEAF,
  },
  {
    iconSrc: '/images/assets/usdt.svg',
    name: 'Liquid Tether',
    precision: 8,
    ticker: AssetTickers.USDT,
  },
]

/**
 * Returns precision for given asset and network
 * FUSD on mainet has a precision of 2 (exception)
 * @param ticker string
 * @param network NetworkNames
 * @returns integer
 */
const getPrecision = (ticker: string, network: NetworkNames) =>
  ticker === AssetTickers.FUSD && network === NetworkNames.MAINNET ? 2 : 8

/**
 * Returns all supported assets
 * @param network network name
 * @returns array of coins
 */
export const supportedAssets = (network = defaultNetwork): Coin[] => {
  const assets = []
  for (const asset of ProtoAssets) {
    const { ticker } = asset
    const assetHash = AssetHashes[ticker][network]
    if (assetHash) {
      asset.precision = getPrecision(ticker, network)
      assets.push({ ...asset, assetHash })
    }
  }
  return assets
}

/**
 * Find asset by ticker
 * @param ticker string
 * @param network network name
 * @returns coin or undefined
 */
export const findAssetByTicker = (
  ticker: string,
  network: NetworkNames,
): Coin => {
  const asset = supportedAssets(network).find((a) => a.ticker === ticker)
  if (!asset) throw new Error(`unknown ticker ${ticker}`)
  return asset
}

/**
 * Find asset by hash
 * @param assetHash string
 * @param network network name
 * @returns coin or undefined
 */
export const findAssetByHash = (
  assetHash: string,
  network = NetworkNames.TESTNET,
): Coin => {
  const asset = supportedAssets(network).find((a) => a.assetHash === assetHash)
  if (!asset) throw new Error(`unknown asset hash ${assetHash}`)
  return asset
}
