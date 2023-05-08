import { CoinPair } from 'lib/types'
import Modal, { ModalIds } from './modal'
import Image from 'next/image'
import { TradeStatus } from 'lib/constants'
import ExplorerLink from 'components/explorerLink'

interface TradeModalProps {
  close: () => void
  error?: string
  pair: CoinPair
  status?: TradeStatus
  txid?: string
}

const TradeModal = ({ close, error, pair, status, txid }: TradeModalProps) => {
  // reusable close modal button
  const CloseButton = () => (
    <button
      type="button"
      className="button is-primary is-medium is-rounded mt-6"
      onClick={close}
    >
      Close
    </button>
  )

  return (
    <Modal id={ModalIds.Trade}>
      <div className="columns">
        <div className="column is-full has-text-centered mt-6">
          {status === TradeStatus.WAITING && (
            <>
              <Image
                src={'/images/icons/loading.svg'}
                alt="success icon"
                height={128}
                width={128}
              />
              <div className="block mt-6 mb-3">
                <h1 className="title has-text-white">
                  Waiting for Confirmation...
                </h1>
                <p className="subtitle">
                  Swapping {pair.from.amount} {pair.from.name} for{' '}
                  {pair.dest.amount} {pair.dest.name}
                </p>
                <p className="subtitle is-6 has-text-weight-light has-text-grey">
                  Confirm this transaction in your Marina wallet
                </p>
              </div>
            </>
          )}

          {status === TradeStatus.COMPLETED && (
            <>
              <Image
                src={'/images/icons/success.svg'}
                alt="success icon"
                height={128}
                width={128}
              />
              <div className="block mt-6 mb-3">
                <h1 className="title is-3 has-text-white">Trade Completed</h1>
                <ExplorerLink
                  url={'https://blockstream.info/liquid/tx/' + txid}
                />
                <CloseButton />
              </div>
            </>
          )}
          {status !== TradeStatus.COMPLETED && status !== TradeStatus.WAITING && (
            <>
              <Image
                src={'/images/icons/error.svg'}
                alt="error icon"
                height={128}
                width={128}
              />
              <div className="block mt-6 mb-3">
                <h1 className="title has-text-white">Something went wrong</h1>
                <p className="subtitle">{error}</p>
                <CloseButton />
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TradeModal
