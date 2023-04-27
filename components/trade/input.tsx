import Image from 'next/image'
import { Coin } from '../../lib/types'
import { useEffect, useState } from 'react'

interface CoinInputProps {
  coin: Coin
  setAmount: (arg0: string) => void
  openAssetsModal: () => void
}

export default function CoinInput({
  coin,
  setAmount,
  openAssetsModal,
}: CoinInputProps): any {
  const [value, setValue] = useState('')

  // handle change of value on input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setAmount(value)
    setValue(value)
  }

  useEffect(() => {
    setValue(typeof coin.amount === 'undefined' ? '' : coin.amount.toString())
  }, [coin.amount])

  // deconstruct coin
  const { iconSrc, ticker } = coin

  return (
    <div className="columns mx-1 mt-0 has-background-dark">
      <div className="column pl-4 pt-4 is-half">
        <a onClick={openAssetsModal}>
          <div className="is-flex is-align-items-center">
            <Image src={iconSrc} alt="coin logo" height={32} width={32} />
            <p className="subtitle has-text-white ml-4">{ticker}</p>
          </div>
        </a>
      </div>
      <div className="column p-0">
        <input
          className="input is-large has-background-dark has-text-white has-text-right"
          onChange={handleChange}
          placeholder="0.00"
          type="text"
          value={value}
        />
      </div>
    </div>
  )
}
