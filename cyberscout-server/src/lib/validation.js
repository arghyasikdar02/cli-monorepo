export function requireFields(body, fields) {
  const missing = fields.filter(field => body?.[field] === undefined || body?.[field] === null || body?.[field] === '')
  return missing.length ? `Missing required field(s): ${missing.join(', ')}` : null
}

export function pick(body, fields) {
  return fields.reduce((acc, field) => {
    if (body?.[field] !== undefined) acc[field] = body[field]
    return acc
  }, {})
}

export function validatePassword(password) {
  const value = String(password || '')
  if (value.length < 12) return 'Use at least 12 characters. A short passphrase is acceptable.'
  if (value.length > 128) return 'Password must be 128 characters or fewer.'
  if (/^(password|password123|12345678|qwerty|letmein)$/i.test(value)) return 'Choose a less common password.'
  return ''
}
