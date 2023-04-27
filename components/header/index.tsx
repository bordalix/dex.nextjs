import ConnectButton from './button'

export default function Header(): any {
  return (
    <div className="hero-head">
      <div className="container is-max-desktop has-text-right mt-3 mr-3">
        <ConnectButton />
      </div>
    </div>
  )
}
