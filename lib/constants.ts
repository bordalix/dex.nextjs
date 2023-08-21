// marina account IDs
export const marinaMainAccountID = 'mainAccount' // m/84'/1776'/0'
export const marinaTestnetMainAccountID = 'mainAccountTest' // m/84'/1'/0'
export const marinaLegacyMainAccountID = 'mainAccountLegacy' // m/44'/0'/0'

export const enum NetworkNames {
  MAINNET = 'liquid',
  TESTNET = 'testnet',
}

export const enum TradeStatusMessage {
  ConnectWallet = 'Connect wallet',
  EnterAmount = 'Enter an amount',
  ErrorCompleting = 'Error completing trade',
  ErrorPreview = 'Preview not available',
  ErrorSigning = 'Error signing',
  InvalidAmount = 'Invalid amount',
  InvalidPair = 'Pair not supported',
  InvalidRegistry = 'Invalid registry response',
  NoBalance = 'Not enough balance on Marina',
  NoMarkets = 'No markets found',
  NoProviders = 'No TDEX provider found',
  SwapNotAccepted = 'TDEX swap not accepted',
  Trade = 'Trade',
}

export const enum TradeStatus {
  PROPOSING,
  CONFIRM,
  COMPLETED,
  ERROR,
}
