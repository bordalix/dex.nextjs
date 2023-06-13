import { Coin } from './types'
import {
  detectProvider,
  MarinaProvider,
  Balance,
  Utxo,
  NetworkString,
  Transaction,
  AccountID,
  SentTransaction,
  Address,
} from 'marina-provider'
import {
  marinaLegacyMainAccountID,
  marinaMainAccountID,
  marinaTestnetMainAccountID,
} from './constants'
import { defaultNetwork } from './defaults'

/**
 * Get balance for all assets on Marina wallet
 * @returns Balance[]
 */
export async function getBalances(): Promise<Balance[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  if (!(await marina.isEnabled())) return []
  const mainAccountIDs = await getMainAccountIDs()
  return marina.getBalances(mainAccountIDs)
}

/**
 * Get balance for a given asset
 * @param asset Coin
 * @param balances Balance[]
 * @returns number
 */
export function getCoinBalance(asset: Coin, balances: Balance[]): number {
  const found = balances.find((a) => a.asset.assetHash === asset.assetHash)
  if (!found || !found.amount) return 0
  return found.amount
}

/**
 * Return marina provider object if defined
 * @returns MarinaProvider | undefined
 */
export async function getMarinaProvider(): Promise<MarinaProvider | undefined> {
  if (typeof window === 'undefined') return undefined
  try {
    return await detectProvider('marina')
  } catch {
    console.info('Please install Marina extension')
    return undefined
  }
}

/**
 * Return network on Marina
 * @returns NetworkString
 */
export async function getNetwork(): Promise<NetworkString> {
  const marina = await getMarinaProvider()
  if (marina) return await marina.getNetwork()
  return defaultNetwork
}

/**
 * Return all coins for Marina's main account ids
 * @returns Utxo[]
 */
export async function getCoins(): Promise<Utxo[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  const mainAccountIDs = await getMainAccountIDs()
  return await marina.getCoins(mainAccountIDs)
}

/**
 * Return transactions
 * @returns Transaction[]
 */
export async function getTransactions(): Promise<Transaction[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  return marina.getTransactions()
}

/**
 * Sign partial transaction (in base64)
 * @param partialTransaction string in base64
 * @returns signed transaction as string in base64
 */
export async function signTx(partialTransaction: string): Promise<string> {
  // check for marina
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('Please install Marina')
  // sign transaction
  return await marina.signTransaction(partialTransaction)
}

/**
 * Return next address for (optional) given account id
 * @param accountID optional AccountID
 * @returns Address
 */
export async function getNextAddress(accountID?: AccountID) {
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('No Marina provider found')
  const mainAccountIDs = await getMainAccountIDs(false)
  const id = accountID ?? mainAccountIDs[0]
  await marina.useAccount(id)
  const address = await marina.getNextAddress()
  if (id !== mainAccountIDs[0]) await marina.useAccount(mainAccountIDs[0])
  return address
}

/**
 * Return next change address for (optional) given account id
 * @param accountID optional AccountID
 * @returns Address
 */
export async function getNextChangeAddress(
  accountID?: AccountID,
): Promise<Address> {
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('No Marina provider found')
  const mainAccountIDs = await getMainAccountIDs(false)
  const id = accountID ?? mainAccountIDs[0]
  await marina.useAccount(id)
  const address = await marina.getNextChangeAddress()
  if (id !== mainAccountIDs[0]) await marina.useAccount(mainAccountIDs[0])
  return address
}

/**
 * Return Marina's main account id
 * @param withLegacy optional boolean
 * @returns AccountID[]
 */
export async function getMainAccountIDs(
  withLegacy = true,
): Promise<AccountID[]> {
  const network = await getNetwork()
  const mainAccounts = withLegacy ? [marinaLegacyMainAccountID] : []
  return mainAccounts.concat(
    network === 'liquid' ? marinaMainAccountID : marinaTestnetMainAccountID,
  )
}

/**
 * Broadcast given tx (string hex) with Marina
 * @param rawTxHex tx to be broadcasted, string in hexadecimal
 * @returns SentTransaction
 */
export async function broadcastTx(rawTxHex: string): Promise<SentTransaction> {
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('No Marina provider found')
  return marina.broadcastTransaction(rawTxHex)
}
