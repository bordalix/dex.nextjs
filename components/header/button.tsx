import { useContext } from 'react'
import { WalletContext } from 'providers/wallet'

export default function ConnectButton() {
  const { connected, marina, setConnected } = useContext(WalletContext)

  const toggle = async () => {
    if (!marina) return
    if (connected) {
      await marina.disable()
      setConnected(false)
    } else {
      await marina.enable()
      setConnected(true)
    }
  }

  return (
    <>
      {marina ? (
        <>
          <button onClick={toggle} className="button is-primary my-auto mr-4">
            {connected ? 'Disconnect' : 'Connect with Marina'}
          </button>
        </>
      ) : (
        <a
          href="https://vulpem.com/marina"
          target="_blank"
          rel="noreferrer"
          className="button is-primary my-auto"
        >
          Install Marina
        </a>
      )}
    </>
  )
}
