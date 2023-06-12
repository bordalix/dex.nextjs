import { findAssetByTicker } from './assets'
import { NetworkNames } from './constants'

export const defaultNetwork = NetworkNames.TESTNET

export const defaultDestAsset = (network = defaultNetwork) =>
  findAssetByTicker('L-BTC', network)

export const defaultFromAsset = (network = defaultNetwork) =>
  findAssetByTicker('FUJI', network)
