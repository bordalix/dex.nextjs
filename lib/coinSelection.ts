import type { Utxo } from 'marina-provider'
import { Coin } from './types'
import { utxoValue } from './utils'

/**
 * Coin selection strategy: accumulate utxos until target value is achieved
 * @param utxos Utxo[]
 * @param target number
 * @returns Utxo[]
 */
const accumulativeStrategy = (utxos: Utxo[], target: number): Utxo[] => {
  let totalValue = 0
  const selectedUtxos = []

  // push coins until target reached
  for (const utxo of utxos) {
    selectedUtxos.push(utxo)
    totalValue += utxoValue(utxo)
    if (totalValue >= target) return selectedUtxos
  }

  // not enough funds
  return []
}

/**
 * Coin selection strategy: tries to get an exact target value (no change)
 * @param utxos Utxo[]
 * @param target number
 * @returns Utxo[]
 */
const branchAndBoundStrategy = (
  utxos: Utxo[],
  target: number,
): Utxo[] | undefined => {
  const MAX_TRIES = 1_000
  const selected: number[] = []

  let backtrack
  let currTry = 0
  let currValue = 0
  let utxo_pool_index = 0

  // calculate total available value
  let totalValue = utxos.reduce((acc: number, utxo) => acc + utxoValue(utxo), 0)

  // return undefined if we don't have enough funds
  if (totalValue < target) return

  // perform a depth-first search for choosing utxos
  while (currTry < MAX_TRIES) {
    // return if we found a working combination
    if (currValue == target) break

    // by default, don't backtrack
    backtrack = false

    // conditions for backtracking
    // 1. cannot reach target with remaining amount
    // 2. selected value is greater than upperbound
    if (currValue + totalValue < target || currValue > target) backtrack = true

    // backtrack if necessary
    if (backtrack) {
      // we walked back to first UTXO, all branches are traversed, we are done
      if (selected.length === 0) break

      // add omitted utxos back before traversing the omission branch of last included utxo
      utxo_pool_index -= 1
      while (utxo_pool_index > selected[selected.length - 1]) {
        totalValue += utxoValue(utxos[utxo_pool_index])
        utxo_pool_index -= 1
      }

      // remove last included utxo from selected list
      currValue -= utxoValue(utxos[utxo_pool_index])
      if (currValue < 0) return // something went wrong
      selected.pop()
    } else {
      // continue on this branch, add the next utxo to selected list
      let utxo = utxos[utxo_pool_index]

      // remove this utxo from total available amount
      totalValue -= utxoValue(utxo)
      if (totalValue < 0) return // something went wrong

      // if this utxo is the first one or
      // if the previous index is included and therefore not relevant for exclusion shortcut
      if (
        selected.length === 0 ||
        utxo_pool_index - 1 === selected[selected.length - 1]
      ) {
        selected.push(utxo_pool_index)
        currValue += utxoValue(utxo)
      }
    }

    currTry += 1
    utxo_pool_index += 1
  }

  // if we exhausted all tries, return undefined
  if (currTry >= MAX_TRIES) return

  // if no coins found, return undefined
  if (selected.length === 0) return

  // return the selected utxos
  return selected.map((i) => utxos[i])
}

/**
 * Select coins for a given amount, with respective blinding private key
 * @param utxos Utxo[]
 * @param coin Coin
 * @returns Utxo[]
 */
export function selectCoins(utxos: Utxo[], coin: Coin): Utxo[] {
  // validate coin
  const { amount, assetHash } = coin
  if (!amount) return []

  // sort utxos in descending order of value: will decrease number of inputs
  // (and fees) but will increase utxo fragmentation
  const _utxos = utxos
    .filter(
      (utxo) => utxo.blindingData && utxo.blindingData.asset === assetHash,
    )
    .sort((a, b) => utxoValue(b) - utxoValue(a))

  // try to find a combination with exact value (aka no change) first
  return (
    branchAndBoundStrategy(_utxos, amount) ??
    accumulativeStrategy(_utxos, amount)
  )
}
