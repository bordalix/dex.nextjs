import Image from 'next/image'

export default function Footer() {
  return (
    <div className="hero-foot">
      <div className="is-flex is-justify-content-center is-align-items-center">
        <p className="subtitle mb-0 mr-2">Swap powered by</p>
        <Image
          src={'/images/icons/tdex_logo.svg'}
          alt="tdex logo"
          height={64}
          width={64}
        />
      </div>
    </div>
  )
}
