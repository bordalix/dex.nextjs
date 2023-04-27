import { Coin } from './types'
import {
  AssetHashes,
  AssetNames,
  AssetTickers,
  NetworkNames,
  PRECISION,
} from './constants'

/**
 * Returns all supported coins
 * @param network network name
 * @returns array of coins
 */
export const assets = (network: NetworkNames): Coin[] => [
  {
    assetHash: AssetHashes[AssetNames.FUJI][network],
    iconSrc: '/images/assets/lbtc.svg',
    name: AssetNames.FUJI,
    precision: PRECISION,
    ticker: AssetTickers.FUJI,
  },
  {
    assetHash: AssetHashes[AssetNames.LBTC][network],
    iconSrc: '/images/assets/lbtc.svg',
    name: AssetNames.LBTC,
    precision: PRECISION,
    ticker: AssetTickers.LBTC,
  },
  {
    assetHash: AssetHashes[AssetNames.LCAD][network],
    iconSrc: '/images/assets/lcad.png',
    name: AssetNames.LCAD,
    precision: PRECISION,
    ticker: AssetTickers.LCAD,
  },
  {
    assetHash: AssetHashes[AssetNames.USDT][network],
    iconSrc: '/images/assets/usdt.svg',
    name: AssetNames.USDT,
    precision: PRECISION,
    ticker: AssetTickers.USDT,
  },
]
