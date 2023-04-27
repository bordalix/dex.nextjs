import { assets } from './coins'
import { NetworkNames } from './constants'

export const defaultNetwork = NetworkNames.TESTNET

export const defaultDestAsset = (network = defaultNetwork) => assets(network)[3]
export const defaultFromAsset = (network = defaultNetwork) => assets(network)[0]
