import { CoinPair, TDEXMarket } from 'lib/types'
import { Utxo } from 'marina-provider'

export async function makeTrade(
  market: TDEXMarket,
  pair: CoinPair,
  utxos: Utxo[],
) {
  console.log('market', market)
  console.log('pair', pair)
  console.log('utxos', utxos)
  return 'faketxid'
}
