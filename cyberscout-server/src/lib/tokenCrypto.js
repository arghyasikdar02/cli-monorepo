import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

function key() {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET
  if (!raw || raw.length < 32) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY must be at least 32 characters')
  return createHash('sha256').update(raw).digest()
}

export function encryptToken(value) {
  if (!value) return null
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

export function decryptToken(value) {
  if (!value) return null
  const [version, ivText, tagText, encryptedText] = String(value).split(':')
  if (version !== 'v1' || !ivText || !tagText || !encryptedText) throw new Error('Invalid encrypted token payload')
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivText, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
