import { ReactNode } from 'react'

const closeModals = () => {
  const modals = document.querySelectorAll('.modal') || []
  modals.forEach((modal) => {
    modal.classList.remove('is-active')
  })
}

export enum ModalIds {
  AssetsList = 'assets-list',
}

interface ModalProps {
  children: ReactNode
  id: string
  reset?: () => void
}

const Modal = ({ children, id, reset }: ModalProps) => {
  const handleClick = () => {
    if (reset) reset()
    closeModals()
  }
  return (
    <div className="modal" id={id}>
      <div onClick={handleClick} className="modal-background" />
      <div className="modal-content box has-background-black">
        <div className="columns">
          <div className="column is-half is-offset-one-quarter">{children}</div>
        </div>
      </div>
      <button
        onClick={handleClick}
        className="modal-close is-large"
        aria-label="close"
      />
    </div>
  )
}

export default Modal
