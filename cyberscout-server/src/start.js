import 'dotenv/config'
import { validateEnvironment } from './lib/environment.js'

try {
  validateEnvironment()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid server environment')
  process.exit(1)
}

await import('./index.js')
