import { CoinPair } from 'lib/types'
import Modal, { ModalIds } from './modal'
import Image from 'next/image'
import { TradeStatus } from 'lib/constants'
import ExplorerLink from 'components/explorerLink'
import { fromSatoshis } from 'lib/utils'
import { ReactNode } from 'react'

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

  // reusable title
  const Title = ({ children }: { children: ReactNode }) => (
    <h1 className="title is-3 has-text-white mt-6">{children}</h1>
  )

  // resusable subtitle
  const Subtitle = ({ children }: { children: ReactNode }) => <p>{children}</p>

  // resusable notice
  const Notice = ({ children }: { children: ReactNode }) => (
    <p className="is-6 has-text-weight-light has-text-grey">{children}</p>
  )

  const state =
    status === TradeStatus.WAITING
      ? 'waiting'
      : status === TradeStatus.COMPLETED
      ? 'completed'
      : 'error'

  return (
    <Modal id={ModalIds.Trade}>
      <div className="columns">
        <div className="column is-full has-text-centered mt-6">
          {state === 'waiting' && (
            <>
              <Image
                src={'/images/icons/loading.svg'}
                alt="success icon"
                height={128}
                width={128}
              />
              <Title>Waiting for Confirmation...</Title>
              <Subtitle>
                Swapping {fromSatoshis(pair.from.amount)} {pair.from.name} for{' '}
                {fromSatoshis(pair.dest.amount)} {pair.dest.name}
              </Subtitle>
              <Notice>Confirm this transaction in your Marina wallet</Notice>
            </>
          )}
          {state === 'completed' && (
            <>
              <Image
                src={'/images/icons/success.svg'}
                alt="success icon"
                height={128}
                width={128}
              />
              <Title>Trade Completed</Title>
              <ExplorerLink
                url={'https://blockstream.info/liquid/tx/' + txid}
              />
              <CloseButton />
            </>
          )}
          {state === 'error' && (
            <>
              <Image
                src={'/images/icons/error.svg'}
                alt="error icon"
                height={128}
                width={128}
              />
              <Title>Something went wrong</Title>
              <Subtitle>{error}</Subtitle>
              <CloseButton />
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TradeModal
