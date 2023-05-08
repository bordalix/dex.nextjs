import { TradeStatusMessage } from 'lib/constants'

interface TradeButtonProps {
  loading: boolean
  onClick: () => void
  status: string
}

export default function TradeButton({
  loading,
  onClick,
  status,
}: TradeButtonProps) {
  const btnStyle = 'button is-primary is-medium is-fullwidth mt-4'
  const disabled = status !== TradeStatusMessage.Trade
  return (
    <button
      className={btnStyle + (loading ? ' is-loading' : '')}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {status}
    </button>
  )
}
