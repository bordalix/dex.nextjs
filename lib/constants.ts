// marina account IDs
export const marinaMainAccountID = 'mainAccount' // m/84'/1776'/0'
export const marinaTestnetMainAccountID = 'mainAccountTest' // m/84'/1'/0'
export const marinaLegacyMainAccountID = 'mainAccountLegacy' // m/44'/0'/0'

export const enum TradeButtonStatus {
  Trade = 'Trade',
  EnterAmount = 'Enter an amount',
  InvalidPair = 'Pair not supported',
  ConnectWallet = 'Connect wallet',
  ErrorPreview = 'Preview not available',
  NoMarinaBalance = 'Not enough balance on Marina',
  NoMarketBalance = 'Not enough balance on Market',
}

export const enum TradeStatus {
  WAITING,
  COMPLETED,
  ERROR,
}

export enum Fiat {
  CAD = 'Canadian dollar',
  EUR = 'Euro',
  USD = 'US dollar',
}

export const FiatSymbol: Record<Fiat, string> = {
  [Fiat.CAD]: 'C$',
  [Fiat.EUR]: '€',
  [Fiat.USD]: '$',
}

export const PRECISION = 8

export const enum NetworkNames {
  MAINNET = 'liquid',
  TESTNET = 'testnet',
}

export const enum AssetNames {
  FUJI = 'Fuji USD',
  LBTC = 'Liquid bitcoin',
  LCAD = 'Liquid CAD',
  USDT = 'Tether USD',
}

export const enum AssetTickers {
  FUJI = 'FUJI',
  LBTC = 'L-BTC',
  LCAD = 'LCAD',
  USDT = 'USDT',
}

interface IAssetHash {
  [network: string]: string
}

export const AssetHashes: Record<string, IAssetHash> = {
  [AssetNames.FUJI]: {
    [NetworkNames.TESTNET]:
      '0d86b2f6a8c3b02a8c7c8836b83a081e68b7e2b4bcdfc58981fc5486f59f7518',
  },
  [AssetNames.LBTC]: {
    [NetworkNames.MAINNET]:
      '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    [NetworkNames.TESTNET]:
      '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
  },
  [AssetNames.LCAD]: {
    [NetworkNames.MAINNET]:
      '0e99c1a6da379d1f4151fb9df90449d40d0608f6cb33a5bcbfc8c265f42bab0a',
    [NetworkNames.TESTNET]:
      'ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926',
  },
  [AssetNames.USDT]: {
    [NetworkNames.MAINNET]:
      'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
    [NetworkNames.TESTNET]:
      'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958',
  },
}

// used on FiatValue component
export const CoinGeckoId: Record<string, string> = {
  [AssetHashes[AssetNames.LBTC][NetworkNames.MAINNET]]: 'bitcoin',
  [AssetHashes[AssetNames.USDT][NetworkNames.MAINNET]]: 'tether',
  [AssetHashes[AssetNames.LCAD][NetworkNames.MAINNET]]: 'lcad',
  [Fiat.CAD]: 'cad',
  [Fiat.EUR]: 'eur',
  [Fiat.USD]: 'usd',
}
