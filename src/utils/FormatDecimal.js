/**
 * Formate un nombre avec 2 chiffres après la virgule
 * @param {number|string} value
 * @returns {string}
 */
export function formatDecimal(value) {
  if (value === null || value === undefined || value === '') {
    return '0.00'
  }

  const number = Number(value)

  if (isNaN(number)) {
    return '0.00'
  }

  return number.toFixed(2)
}
