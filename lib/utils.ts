import Decimal from 'decimal.js'

/**
 * Converts currency from satoshis to unit
 * @param integer to convert defaults to 0
 * @param precision defaults to 8
 * @returns number in units
 */
export function fromSatoshis(
  integer: number = 0,
  precision: number = 8,
): number {
  return new Decimal(integer).div(Decimal.pow(10, precision)).toNumber()
}

/**
 * Converts currency unit to satoshis
 * @param number to convert defaults to 0
 * @param precision defaults to 8
 * @returns number in satoshis
 */
export const toSatoshis = (fractional = 0, precision = 8): number => {
  return Decimal.floor(
    new Decimal(fractional).mul(Decimal.pow(10, precision)),
  ).toNumber()
}

/**
 * Opens modal with given id
 * @param id modal id
 * @returns void
 */
export const openModal = (id: string): void => {
  document.getElementById(id)?.classList.add('is-active')
}

/**
 * Closes modal with given id
 * @param id modal id
 * @returns void
 */
export const closeModal = (id: string): void => {
  document.getElementById(id)?.classList.remove('is-active')
}

export async function sleep(miliseconds: number) {
  await Promise.resolve(
    new Promise((resolve) => {
      setTimeout(resolve, miliseconds)
    }),
  )
}

// format numbers
export const prettyNumber = (num = 0, min = 2, max = 8): string => {
  if (num === 0) return '0'
  return new Intl.NumberFormat('en-us', {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(num)
}
