import { Coin } from './types'
import { NetworkNames } from './constants'
import { defaultNetwork } from './defaults'

// Note: Coin is an Asset with imgSrc and not mandatory amount
interface IAssetHash {
  [network: string]: string
}

// id (aka hash) for assets across different networks
const AssetHashes: Record<string, IAssetHash> = {
  FUJI: {
    [NetworkNames.TESTNET]:
      '0d86b2f6a8c3b02a8c7c8836b83a081e68b7e2b4bcdfc58981fc5486f59f7518',
    [NetworkNames.MAINNET]:
      '0dea022a8a25abb128b42b0f8e98532bc8bd74f8a77dc81251afcc13168acef7',
  },
  LBTC: {
    [NetworkNames.MAINNET]:
      '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    [NetworkNames.TESTNET]:
      '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
  },
  LCAD: {
    [NetworkNames.MAINNET]:
      '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    [NetworkNames.TESTNET]:
      'ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926',
  },
  USDT: {
    [NetworkNames.MAINNET]:
      'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    [NetworkNames.TESTNET]:
      'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958',
  },
}

// common characteristics for a coin across different networks
const ProtoAssets: Record<string, Omit<Coin, 'assetHash'>> = {
  FUJI: {
    iconSrc: '/images/assets/fusd.svg',
    name: 'Fuji USD',
    precision: 8,
    ticker: 'FUJI',
  },
  LBTC: {
    iconSrc: '/images/assets/lbtc.svg',
    name: 'Liquid Bitcoin',
    precision: 8,
    ticker: 'L-BTC',
  },
  LCAD: {
    iconSrc: '/images/assets/lcad.png',
    name: 'Liquid CAD',
    precision: 8,
    ticker: 'LCAD',
  },
  USDT: {
    iconSrc: '/images/assets/usdt.svg',
    name: 'Liquid Tether',
    precision: 8,
    ticker: 'USDT',
  },
}

/**
 * Returns all supported assets
 * @param network network name
 * @returns array of coins
 */
export const supportedAssets = (network = defaultNetwork): Coin[] => {
  const assets = []
  for (const [key, asset] of Object.entries(ProtoAssets)) {
    if (AssetHashes[key][network]) {
      assets.push({ ...asset, assetHash: AssetHashes[key][network] })
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
