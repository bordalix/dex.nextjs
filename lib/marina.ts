import { Pset } from 'liquidjs-lib'
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

export async function getBalances(): Promise<Balance[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  if (!(await marina.isEnabled())) return []
  const mainAccountIDs = await getMainAccountIDs()
  return marina.getBalances(mainAccountIDs)
}

export function getCoinBalance(asset: Coin, balances: Balance[]): number {
  const found = balances.find((a) => a.asset.assetHash === asset.assetHash)
  if (!found || !found.amount) return 0
  return found.amount
}

export async function getMarinaProvider(): Promise<MarinaProvider | undefined> {
  if (typeof window === 'undefined') return undefined
  try {
    return await detectProvider('marina')
  } catch {
    console.info('Please install Marina extension')
    return undefined
  }
}

export async function getNetwork(): Promise<NetworkString> {
  const marina = await getMarinaProvider()
  if (marina) return await marina.getNetwork()
  return defaultNetwork
}

export async function getCoins(): Promise<Utxo[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  const mainAccountIDs = await getMainAccountIDs()
  return await marina.getCoins(mainAccountIDs)
}

export async function getTransactions(): Promise<Transaction[]> {
  const marina = await getMarinaProvider()
  if (!marina) return []
  return marina.getTransactions()
}

export async function signTx(partialTransaction: string) {
  // check for marina
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('Please install Marina')

  // sign transaction
  const ptx = Pset.fromBase64(partialTransaction)
  return await marina.signTransaction(ptx.toBase64())
}

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

export async function getMainAccountIDs(
  withLegacy = true,
): Promise<AccountID[]> {
  const network = await getNetwork()
  const mainAccounts = withLegacy ? [marinaLegacyMainAccountID] : []
  return mainAccounts.concat(
    network === 'liquid' ? marinaMainAccountID : marinaTestnetMainAccountID,
  )
}

export async function broadcastTx(rawTxHex: string): Promise<SentTransaction> {
  const marina = await getMarinaProvider()
  if (!marina) throw new Error('No Marina provider found')
  return marina.broadcastTransaction(rawTxHex)
}
