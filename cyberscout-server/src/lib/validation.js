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
