import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const EXPIRY = '7d'

export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRY })
export const verifyToken = (token) => jwt.verify(token, SECRET)
