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
    <div className="mx-auto bg-[#d4d0c8] px-4 py-4 min-h-screen">
      
      <h1 className="mb-1 rounded-t-md bg-linear-to-r from-[#0a246a] to-[#3a6ea5] px-3 py-2 text-white font-semibold shadow">
        Advice Board
      </h1>
      <Nav />
      <div className="mx-auto mt-10 max-w-md border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] p-3 shadow">
        <h1 className="mb-3 rounded-t-sm bg-linear-to-r from-[#0a246a] to-[#3a6ea5] px-3 py-2 text-sm font-semibold text-white shadow">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 text-sm focus:outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 text-sm focus:outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 text-sm focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-xs text-red-700">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] py-2 text-sm text-black shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white disabled:opacity-50"
            type="submit"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-3 text-sm">
          {mode === 'login' ? (
            <button
              className="rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] px-2 py-1 text-xs text-black shadow hover:bg-[#f2f0ea] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
              onClick={() => setMode('register')}
            >
              Need an account? Register
            </button>
          ) : (
            <button
              className="rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] px-2 py-1 text-xs text-black shadow hover:bg-[#f2f0ea] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
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