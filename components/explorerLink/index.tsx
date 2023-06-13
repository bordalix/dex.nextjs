import { WalletContext } from 'providers/wallet'
import { useContext } from 'react'

export default function ExplorerLink({ txid }: { txid: string | undefined }) {
  const { network } = useContext(WalletContext)

  if (!txid) return <></>

  const url =
    network === 'testnet'
      ? `https://blockstream.info/liquidtestnet/tx/${txid}`
      : `https://blockstream.info/liquid/tx/${txid}`

  return (
    <a target="_blank" href={url} rel="noreferrer">
      <p className="subtitle">View on Explorer</p>
    </a>
  )
}
