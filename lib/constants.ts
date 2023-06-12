// marina account IDs
export const marinaMainAccountID = 'mainAccount' // m/84'/1776'/0'
export const marinaTestnetMainAccountID = 'mainAccountTest' // m/84'/1'/0'
export const marinaLegacyMainAccountID = 'mainAccountLegacy' // m/44'/0'/0'

export const enum NetworkNames {
  MAINNET = 'liquid',
  TESTNET = 'testnet',
}

export const enum TradeStatusMessage {
  Trade = 'Trade',
  EnterAmount = 'Enter an amount',
  InvalidPair = 'Pair not supported',
  ConnectWallet = 'Connect wallet',
  ErrorPreview = 'Preview not available',
  NoBalance = 'Not enough balance on Marina',
}

export const enum TradeStatus {
  PROPOSING,
  CONFIRM,
  COMPLETED,
  ERROR,
}
