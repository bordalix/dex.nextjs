import axios from 'axios'
import { Creator, Pset, Transaction, Updater, address } from 'liquidjs-lib'
import { getCoins, getNextAddress, getNextChangeAddress } from 'lib/marina'
import { getTradeType } from './market'
import { fetchTradePreview } from './preview'
import {
  TDEXv2PreviewTradeResponse,
  TDEXv2TradeRequest,
  TDEXv2UnblindedInput,
  TDEXv2Market,
  TDEXv2ProposeTradeRequest,
  TDEXv2CompleteTradeResponse,
  TDEXv2CompleteTradeRequest,
  CoinPair,
  TDEXv2ProposeTradeResponse,
} from '../types'
import { selectCoins } from 'lib/coinSelection'
import { makeid } from 'lib/utils'

const axiosPost = async (
  endpoint: string,
  payload: TDEXv2ProposeTradeRequest | TDEXv2CompleteTradeRequest,
) => {
  const opt = { headers: { 'Content-Type': 'application/json' } }
  const res = await axios.post(endpoint, payload, opt)
  return res.data
}

const makePset = async (
  pair: CoinPair,
  preview: TDEXv2PreviewTradeResponse,
): Promise<{ pset: Pset; unblindedInputs: TDEXv2UnblindedInput[] }> => {
  // build Psbt
  const pset = Creator.newPset()
  const updater = new Updater(pset)
  const unblindedInputs: TDEXv2UnblindedInput[] = []

  // select coins to pay swap
  const utxos = selectCoins(await getCoins(), pair.from)
  if (!utxos) throw new Error('Not enough funds')

  // calculate change amount
  const amountToSend = pair.from.amount ?? 0
  const changeAmount =
    utxos.reduce((value, utxo) => value + (utxo.blindingData?.value ?? 0), 0) -
    amountToSend

  // add inputs to pset
  for (const utxo of utxos) {
    updater.addInputs([
      {
        txid: utxo.txid,
        txIndex: utxo.vout,
        witnessUtxo: utxo.witnessUtxo,
        sighashType: Transaction.SIGHASH_ALL,
      },
    ])
    if (utxo.blindingData) {
      unblindedInputs.push({
        index: 0,
        asset: utxo.blindingData.asset,
        amount: utxo.blindingData.value.toString(),
        assetBlinder: utxo.blindingData.assetBlindingFactor,
        amountBlinder: utxo.blindingData.valueBlindingFactor,
      })
    }
  }

  // receiving script
  const receivingAddress = address.fromConfidential(
    (await getNextAddress()).confidentialAddress,
  )

  updater.addOutputs([
    {
      script: receivingAddress.scriptPubKey,
      amount: Number(preview.amount) - Number(preview.feeAmount),
      asset: pair.dest.assetHash,
      blinderIndex: 0,
      blindingPublicKey: receivingAddress.blindingKey,
    },
  ])

  // change address
  const changeAddress = address.fromConfidential(
    (await getNextChangeAddress()).confidentialAddress,
  )

  updater.addOutputs([
    {
      script: changeAddress.scriptPubKey,
      amount: changeAmount,
      asset: pair.from.assetHash,
      blinderIndex: 0,
      blindingPublicKey: changeAddress.blindingKey,
    },
  ])

  console.log('pset aka transaction in swap request', pset)
  return { pset, unblindedInputs }
}

const createSwapRequest = async (
  pair: CoinPair,
  preview: TDEXv2PreviewTradeResponse,
): Promise<TDEXv2TradeRequest> => {
  // validate pair
  if (!pair.from.amount) throw new Error('No pair from amount')

  const { pset, unblindedInputs } = await makePset(pair, preview)

  // make swapRequest and return it
  const swapRequest: TDEXv2TradeRequest = {
    id: makeid(8),
    amountP: pair.from.amount?.toString(),
    assetP: pair.from.assetHash,
    amountR: preview.amount.toString(),
    assetR: pair.dest.assetHash,
    transaction: pset.toBase64(),
    unblindedInputs,
  }
  console.log('swapRequest', swapRequest)

  return swapRequest
}

export const proposeTrade = async (
  market: TDEXv2Market,
  pair: CoinPair,
): Promise<TDEXv2ProposeTradeResponse> => {
  // validate pair
  const { dest, from } = pair
  if (!dest.amount || !from.amount) throw new Error('Invalid pair')

  const preview = (
    await fetchTradePreview({ amount: from.amount, coin: from, market, pair })
  )[0]
  if (!preview) throw new Error('Error on preview')
  console.log('preview before propose request', preview)

  const tradeProposeRequest: TDEXv2ProposeTradeRequest = {
    feeAmount: preview.feeAmount,
    feeAsset: preview.feeAsset,
    market: { baseAsset: market.baseAsset, quoteAsset: market.quoteAsset },
    swapRequest: await createSwapRequest(pair, preview),
    type: getTradeType(market, pair),
  }

  const tradeProposeResponse: TDEXv2ProposeTradeResponse = await axiosPost(
    market.provider.endpoint + '/v2/trade/propose',
    tradeProposeRequest,
  )

  return tradeProposeResponse
}

export const completeTrade = async (
  propose: TDEXv2ProposeTradeResponse,
  market: TDEXv2Market,
  transaction: string,
): Promise<TDEXv2CompleteTradeResponse> => {
  const completeTradeRequest: TDEXv2CompleteTradeRequest = {
    id: makeid(8),
    acceptId: propose.swapAccept.id,
    transaction,
  }
  const completeTradeResponse: TDEXv2CompleteTradeResponse = await axiosPost(
    market.provider.endpoint + '/v2/trade/complete',
    completeTradeRequest,
  )
  return completeTradeResponse
}
