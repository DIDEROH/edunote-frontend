/**
 * Formate un nombre en masquant les zéros inutiles, avec maximum 2 chiffres après la virgule
 * @param {number|string} value
 * @returns {string}
 */
export function formatDecimal(value) {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  const number = Number(value)

  if (isNaN(number)) {
    return '0'
  }

  // Formate à maximum 2 décimales, puis supprime les zéros de fin inutiles
  return Float64Array ? String(Math.round(number * 100) / 100) : number.toFixed(2).replace(/\.?0+$/, '')
}
