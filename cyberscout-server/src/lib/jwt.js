import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const EXPIRY = process.env.JWT_EXPIRES_IN || '7d'

export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRY })
export const verifyToken = (token) => jwt.verify(token, SECRET)
