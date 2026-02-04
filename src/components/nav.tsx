import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()

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

  const linkClass = (path: string) =>
    `mx-4 hover:underline ${
      location.pathname === path
        ? 'text-red-900 font-semibold'
        : 'text-gray-600'
    }`

  return (
    <nav className="flex justify-end items-center mb-6">
      <Link to="/" className={linkClass('/')}>
        Home
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center">
          {username && (
            <span className="mx-2 text-sm text-gray-700">
              Logged in as <strong>{username}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="mx-2 hover:underline text-gray-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className={linkClass('/login')}>
          Login
        </Link>
      )}
    </nav>
  )
}