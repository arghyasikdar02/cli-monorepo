import { Router } from 'express'
import { handleRazorpayWebhook } from './payments.js'

const router = Router()

router.post('/razorpay', handleRazorpayWebhook)

export default router
