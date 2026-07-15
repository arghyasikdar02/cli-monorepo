function isPlaceholder(value) {
  return !value || /change_me|replace_|your_|dummy/i.test(String(value))
}

export function validateEnvironment() {
  if (process.env.NODE_ENV !== 'production') return

  const errors = []
  if (isPlaceholder(process.env.JWT_SECRET) || String(process.env.JWT_SECRET).length < 32) {
    errors.push('JWT_SECRET must be a non-placeholder value of at least 32 characters')
  }
  if (isPlaceholder(process.env.VISITOR_HASH_SALT) || String(process.env.VISITOR_HASH_SALT).length < 24) {
    errors.push('VISITOR_HASH_SALT must be a non-placeholder value of at least 24 characters')
  }
  if (isPlaceholder(process.env.LAB_FLAG_SALT) || String(process.env.LAB_FLAG_SALT).length < 24) {
    errors.push('LAB_FLAG_SALT must be a non-placeholder value of at least 24 characters')
  }
  if (!String(process.env.FRONTEND_URL || '').startsWith('https://')) {
    errors.push('FRONTEND_URL must use HTTPS in production')
  }
  if (!String(process.env.BACKEND_URL || '').startsWith('https://')) {
    errors.push('BACKEND_URL must use HTTPS in production')
  }
  if (!String(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '').trim()) {
    errors.push('CORS_ORIGINS must contain at least one approved frontend origin')
  }
  const hasGoogleClient = Boolean(process.env.GOOGLE_CLIENT_ID)
  const hasGoogleSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET)
  if (hasGoogleClient !== hasGoogleSecret) {
    errors.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together')
  } else if (hasGoogleClient && (isPlaceholder(process.env.GOOGLE_CLIENT_ID) || isPlaceholder(process.env.GOOGLE_CLIENT_SECRET))) {
    errors.push('Google OAuth credentials must not use placeholder values')
  }
  const razorpayValues = [process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET, process.env.RAZORPAY_WEBHOOK_SECRET]
  if (razorpayValues.some(Boolean) && !razorpayValues.every(Boolean)) {
    errors.push('RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET must be configured together')
  } else if (razorpayValues.every(Boolean) && razorpayValues.some(isPlaceholder)) {
    errors.push('Razorpay credentials must not use placeholder values')
  }

  if (errors.length) {
    throw new Error(`Invalid production environment:\n- ${errors.join('\n- ')}`)
  }
}
