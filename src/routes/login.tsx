import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/nav'
import { login, register } from '../modules/module.auth'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { token } = await login(email, password)
        localStorage.setItem('token', token)
        navigate('/')
      } else {
        await register(username, email, password)
        setMode('login')
      }
    } catch {
      setError('Authentication failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-4">
      <Nav />
      <div className="max-w-md mx-auto mt-10 p-4 border rounded">
        <h1 className="text-2xl font-bold mb-4">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            className="w-full border rounded px-2 py-1"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full border rounded px-2 py-1"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-black disabled:opacity-50"
            type="submit"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-3 text-sm">
          {mode === 'login' ? (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setMode('register')}
            >
              Need an account? Register
            </button>
          ) : (
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setMode('login')}
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}