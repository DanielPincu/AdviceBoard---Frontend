import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { login, register } from '../modules/module.auth'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { token } = await login(email, password)
        if (rememberMe) {
          localStorage.setItem('token', token)
          sessionStorage.removeItem('token')
        } else {
          sessionStorage.setItem('token', token)
          localStorage.removeItem('token')
        }
        navigate('/')
      } else {
        await register(username, email, password)
        setMode('login')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the service. Check your connection and try again.')
      } else {
        setError('Authentication failed. Check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="mx-auto min-h-240 px-6 py-6"
      style={{
        backgroundImage: "url('https://cdn.wallpapersafari.com/28/82/OXgnsy.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      <h1 className="flex items-center gap-3 rounded-t-xl bg-linear-to-r from-[#0b5bd3] to-[#79b1ff] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
        <img
          src="https://upload.wikimedia.org/wikipedia/de/thumb/0/00/Windows_Vista_Logo.svg/250px-Windows_Vista_Logo.svg.png"
          alt="Windows Vista"
          className="h-32 w-32 drop-shadow-2xl"
        />
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold text-white">Windows Vista Troubleshooting </span>
          <span className="text-xs text-white/90">Find solutions to common problems</span>
        </div>
      </h1>
      <Nav />
      <div className="mx-auto mt-10 max-w-md rounded-lg border border-white/40 bg-white/70 p-4 shadow-2xl backdrop-blur-md">
        <h1 className="mb-2 rounded-md bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-3 py-2 text-sm font-semibold text-white shadow">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white/80 backdrop-blur-sm px-2 py-1 text-sm focus:outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white/80 backdrop-blur-sm px-2 py-1 text-sm focus:outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white/80 backdrop-blur-sm px-2 py-1 pr-9 text-sm focus:outline-none"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-white/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          {error && <p className="text-xs text-red-700">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-md border border-white/60 bg-linear-to-b from-white/80 to-[#c9def5] py-2 text-sm text-black shadow-md hover:from-white hover:to-[#b7d1f0] active:translate-y-px disabled:opacity-50"
            type="submit"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-3 text-sm">
          {mode === 'login' ? (
            <button
              className="rounded-md border border-white/60 bg-linear-to-b from-white/80 to-[#c9def5] px-2 py-1 text-xs text-black shadow-md hover:from-white hover:to-[#b7d1f0] active:translate-y-px"
              onClick={() => setMode('register')}
            >
              Need an account? Register
            </button>
          ) : (
            <button
              className="rounded-md border border-white/60 bg-linear-to-b from-white/80 to-[#c9def5] px-2 py-1 text-xs text-black shadow-md hover:from-white hover:to-[#b7d1f0] active:translate-y-px"
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