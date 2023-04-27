import { Coin } from 'lib/types'
import Modal, { ModalIds } from './modal'
import Image from 'next/image'
import { closeModal } from 'lib/utils'
import { assets } from 'lib/coins'
import { WalletContext } from 'providers/wallet'
import { useContext } from 'react'

interface AssetListModalProps {
  setDestAsset: (arg0: Coin) => void
  setFromAsset: (arg0: Coin) => void
  side: string
}

const AssetListModal = ({
  setDestAsset,
  setFromAsset,
  side,
}: AssetListModalProps) => {
  const { network } = useContext(WalletContext)

  const handleClick = (a: Coin) => {
    closeModal(ModalIds.AssetsList)
    if (side === 'dest') setDestAsset(a)
    if (side === 'from') setFromAsset(a)
  }

  return (
    <Modal id={ModalIds.AssetsList}>
      <h1 className="title has-text-white">Select an asset</h1>
      {assets(network).map((a, i) => (
        <div
          className="is-flex is-align-items-center my-4"
          onClick={() => handleClick(a)}
          key={i}
        >
          <Image src={a.iconSrc} alt="coin logo" height={32} width={32} />
          <p className="subtitle has-text-white ml-4">{a.name}</p>
        </div>
      ))}
    </Modal>
  )
}

export default AssetListModal
