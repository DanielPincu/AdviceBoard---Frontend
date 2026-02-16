import { Link, useNavigate } from 'react-router-dom'

export default function Nav() {
  const navigate = useNavigate()

  const isAuthenticated = Boolean(localStorage.getItem('token'))

  function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  function getUsernameFromToken(): string | null {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { username?: string }
      return payload?.username ?? null
    } catch {
      return null
    }
  }

  const username = getUsernameFromToken()

  return (
    <nav className="flex justify-end items-center mb-6 rounded-b-xl bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
      <Link to="/" className="mr-4 text-white/90 hover:text-white hover:underline">
        Home
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center">
          {username && (
            <button
              onClick={() => navigate('/user/me')}
              className="mx-3 text-sm text-[#0b3d91] bg-white/70 px-3 py-1 rounded-lg shadow ring-1 ring-white/60 backdrop-blur-sm hover:underline"
            >
              Logged in as <strong>{username}</strong>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="ml-2 rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className="mx-4 rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px">
          Login
        </Link>
      )}
    </nav>
  )
}