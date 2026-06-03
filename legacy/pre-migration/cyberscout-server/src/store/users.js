import bcrypt from 'bcrypt'

const users = new Map()

// Pre-seed test user — password: password123
const seedHash = await bcrypt.hash('password123', 10)
const SEED = {
  id: 'usr_001',
  name: 'Neel',
  email: 'neel0409@gmail.com',
  passwordHash: seedHash,
  googleId: null,
  rank: 'Script Kiddie',
  xp: 6920,
  level: 34,
  streakDays: 12,
  isPro: false,
}
users.set(SEED.id, SEED)

export function findByEmail(email) {
  for (const u of users.values()) if (u.email === email) return u
  return null
}

export function findByGoogleId(googleId) {
  for (const u of users.values()) if (u.googleId === googleId) return u
  return null
}

export function findById(id) {
  return users.get(id) ?? null
}

export function createUser(data) {
  const id = `usr_${Date.now()}`
  const user = { id, rank: 'Novice', xp: 0, level: 1, streakDays: 0, isPro: false, ...data }
  users.set(id, user)
  return user
}

export function publicUser(u) {
  const { passwordHash, ...rest } = u
  return rest
}
