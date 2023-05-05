import { Coin } from './types'
import { NetworkNames, PRECISION } from './constants'

const enum AssetIcons {
  FUJI = '/images/assets/lbtc.svg',
  LBTC = '/images/assets/lbtc.svg',
  LCAD = '/images/assets/lcad.png',
  USDT = '/images/assets/usdt.svg',
}

const enum AssetNames {
  FUJI = 'Fuji USD',
  LBTC = 'Liquid bitcoin',
  LCAD = 'Liquid CAD',
  USDT = 'Tether USD',
}

const enum AssetTickers {
  FUJI = 'FUJI',
  LBTC = 'L-BTC',
  LCAD = 'LCAD',
  USDT = 'USDT',
}

interface IAssetHash {
  [network: string]: string
}

const AssetHashes: Record<string, IAssetHash> = {
  FUJI: {
    [NetworkNames.TESTNET]:
      '0d86b2f6a8c3b02a8c7c8836b83a081e68b7e2b4bcdfc58981fc5486f59f7518',
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

/**
 * Returns all supported coins
 * @param network network name
 * @returns array of coins
 */
export const assets = (network: NetworkNames): Coin[] => [
  {
    assetHash: AssetHashes.FUJI[network],
    iconSrc: AssetIcons.FUJI,
    name: AssetNames.FUJI,
    precision: PRECISION,
    ticker: AssetTickers.FUJI,
  },
  {
    assetHash: AssetHashes.LBTC[network],
    iconSrc: AssetIcons.LBTC,
    name: AssetNames.LBTC,
    precision: PRECISION,
    ticker: AssetTickers.LBTC,
  },
  {
    assetHash: AssetHashes.LCAD[network],
    iconSrc: AssetIcons.LCAD,
    name: AssetNames.LCAD,
    precision: PRECISION,
    ticker: AssetTickers.LCAD,
  },
  {
    assetHash: AssetHashes.USDT[network],
    iconSrc: AssetIcons.USDT,
    name: AssetNames.USDT,
    precision: PRECISION,
    ticker: AssetTickers.USDT,
  },
]
