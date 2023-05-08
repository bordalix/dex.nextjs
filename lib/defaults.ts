import { findAssetByTicker } from './assets'
import { NetworkNames } from './constants'

export const defaultNetwork = NetworkNames.TESTNET

export const defaultDestAsset = (network = defaultNetwork) =>
  findAssetByTicker('USDT', network)

export const defaultFromAsset = (network = defaultNetwork) =>
  findAssetByTicker('FUJI', network)
