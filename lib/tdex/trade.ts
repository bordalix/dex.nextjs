import axios from 'axios'
import { Creator, Pset, Transaction, Updater, address } from 'liquidjs-lib'
import { getCoins, getNextAddress, getNextChangeAddress } from 'lib/marina'
import { getTradeType } from './market'
import { tradePreview } from './preview'
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
  isTDEXv2ProposeTradeResponse,
  isTDEXv2CompleteTradeResponse,
} from '../types'
import { selectCoins } from 'lib/coinSelection'
import { makeid, utxoValue } from 'lib/utils'

/**
 * Uses axios to post to url
 * @param endpoint string
 * @param payload TDEXv2ProposeTradeRequest | TDEXv2CompleteTradeRequest
 * @returns AxiosResponse
 */
const axiosPost = async (
  endpoint: string,
  payload: TDEXv2ProposeTradeRequest | TDEXv2CompleteTradeRequest,
) => {
  try {
    const opt = { headers: { 'Content-Type': 'application/json' } }
    const res = await axios.post(endpoint, payload, opt)
    return res.data
  } catch (err) {
    console.error('axios error', err)
  }
}

/**
 * Creates pset to be used on swap request
 * @param pair CoinPair
 * @param preview TDEXv2PreviewTradeResponse
 * @returns { pset, unblindedInputs }
 */
const makePset = async (
  pair: CoinPair,
  preview: TDEXv2PreviewTradeResponse,
): Promise<{ pset: Pset; unblindedInputs: TDEXv2UnblindedInput[] }> => {
  // build Pset
  const pset = Creator.newPset()
  const updater = new Updater(pset)
  const unblindedInputs: TDEXv2UnblindedInput[] = []

  // select coins to pay swap
  const utxos = selectCoins(await getCoins(), pair.from)
  if (!utxos) throw new Error('Not enough funds')

  // calculate change amount
  const utxosAmount = utxos.reduce((value, utxo) => value + utxoValue(utxo), 0)
  const amountToSend = pair.from.amount ?? 0
  const changeAmount = utxosAmount - amountToSend

  // util to reverse asset and value blinding factors
  const reverseFactor = (hex: string) =>
    Buffer.from(hex, 'hex').reverse().toString('hex')

  // add inputs to pset
  for (let i = 0; i < utxos.length; i++) {
    const utxo = utxos[i]
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
        index: i,
        asset: utxo.blindingData.asset,
        amount: utxo.blindingData.value.toString(),
        assetBlinder: reverseFactor(utxo.blindingData.assetBlindingFactor),
        amountBlinder: reverseFactor(utxo.blindingData.valueBlindingFactor),
      })
    }
  }

  // address to receive the other asset
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

  if (changeAmount > 0) {
    // add output to receive change
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
  }

  return { pset, unblindedInputs }
}

/**
 * Creates swap request object
 * @param pair CoinPair
 * @param preview TDEXv2PreviewTradeResponse
 * @returns TDEXv2TradeRequest
 */
const createSwapRequest = async (
  pair: CoinPair,
  preview: TDEXv2PreviewTradeResponse,
): Promise<TDEXv2TradeRequest> => {
  // validate pair
  if (!pair.from.amount) throw new Error('No pair.from amount')

  const { pset, unblindedInputs } = await makePset(pair, preview)

  // create swapRequest object and return it
  const swapRequest: TDEXv2TradeRequest = {
    id: makeid(8),
    amountP: pair.from.amount.toString(),
    assetP: pair.from.assetHash,
    amountR: preview.amount.toString(),
    assetR: pair.dest.assetHash,
    transaction: pset.toBase64(),
    unblindedInputs,
  }

  return swapRequest
}

/**
 * Propose trade to tdex-daemon
 * @param market TDEXv2Market
 * @param pair CoinPair
 * @returns TDEXv2ProposeTradeResponse
 */
export const proposeTrade = async (
  market: TDEXv2Market,
  pair: CoinPair,
): Promise<TDEXv2ProposeTradeResponse> => {
  // validate pair
  const { dest, from } = pair
  if (!dest.amount || !from.amount) throw new Error('Invalid pair')

  // fetch trade preview
  const preview = await tradePreview(from.amount, from, market, pair)

  // create trade propose request object
  const tradeProposeRequest: TDEXv2ProposeTradeRequest = {
    feeAmount: preview.feeAmount,
    feeAsset: preview.feeAsset,
    market: { baseAsset: market.baseAsset, quoteAsset: market.quoteAsset },
    swapRequest: await createSwapRequest(pair, preview),
    type: getTradeType(market, pair),
  }

  // request trade proposal and return response
  const tradeProposeResponse: TDEXv2ProposeTradeResponse = await axiosPost(
    market.provider.endpoint + '/v2/trade/propose',
    tradeProposeRequest,
  )
  if (!isTDEXv2ProposeTradeResponse(tradeProposeResponse))
    throw new Error('Invalid trade propose response')

  return tradeProposeResponse
}

/**
 * Complete trade to tdex-daemon
 * @param propose TDEXv2ProposeTradeResponse
 * @param market TDEXv2Market
 * @param transaction: string
 * @returns TDEXv2CompleteTradeResponse
 */
export const completeTrade = async (
  propose: TDEXv2ProposeTradeResponse,
  market: TDEXv2Market,
  transaction: string,
): Promise<TDEXv2CompleteTradeResponse> => {
  // validate proposal was accepted
  if (!propose.swapAccept) throw new Error('Propose not accepted')

  // create complete trade request object
  const completeTradeRequest: TDEXv2CompleteTradeRequest = {
    swapComplete: {
      acceptId: propose.swapAccept.id,
      transaction,
    },
  }

  // request complete trade and return response
  const completeTradeResponse: TDEXv2CompleteTradeResponse = await axiosPost(
    market.provider.endpoint + '/v2/trade/complete',
    completeTradeRequest,
  )
  if (!isTDEXv2CompleteTradeResponse(completeTradeResponse))
    throw new Error('Invalid complete trade response')

  return completeTradeResponse
}
