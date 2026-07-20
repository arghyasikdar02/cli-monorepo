const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const NUMBERS = '23456789'
const SYMBOLS = '!@#$%&*+-=?'
const ALL = `${UPPER}${LOWER}${NUMBERS}${SYMBOLS}`

function secureIndex(max) {
  const limit = Math.floor(256 / max) * max
  const values = new Uint8Array(1)
  do window.crypto.getRandomValues(values)
  while (values[0] >= limit)
  return values[0] % max
}

function characterFrom(characters) {
  return characters[secureIndex(characters.length)]
}

export function generateInstructorPassword(length = 18) {
  const safeLength = Math.max(14, Math.min(64, length))
  const characters = [characterFrom(UPPER), characterFrom(LOWER), characterFrom(NUMBERS), characterFrom(SYMBOLS)]
  while (characters.length < safeLength) characters.push(characterFrom(ALL))
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const target = secureIndex(index + 1)
    ;[characters[index], characters[target]] = [characters[target], characters[index]]
  }
  return characters.join('')
}

export function instructorPasswordIssue(password) {
  if (String(password).length < 14) return 'Use at least 14 characters.'
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return 'Include uppercase, lowercase, number and symbol characters.'
  }
  return ''
}
