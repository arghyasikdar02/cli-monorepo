import { useSearchParams } from 'react-router-dom'
import LoginPage from './LoginPage'
import SignUpPage from './SignUpPage'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  return searchParams.get('mode') === 'signup' ? <SignUpPage /> : <LoginPage />
}
