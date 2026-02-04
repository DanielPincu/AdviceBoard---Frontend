import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()

  const isAuthenticated = Boolean(localStorage.getItem('token'))

  function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

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

      <Link to="/about" className={linkClass('/about')}>
        About
      </Link>

      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="mx-4 hover:underline text-gray-600"
        >
          Logout
        </button>
      ) : (
        <Link to="/login" className={linkClass('/login')}>
          Login
        </Link>
      )}
    </nav>
  )
}