import Image from 'next/image'

export default function Arrow({ onClick }: { onClick: () => void }) {
  return (
    <div className="has-text-centered">
      <figure className="image is-24x24 is-inline-block mb-1">
        <Image
          src={'/images/icons/arrow.svg'}
          alt="arrow down logo"
          height={24}
          width={24}
          onClick={onClick}
        />
      </figure>
    </div>
  )
}
