import { Link } from 'react-router-dom'

export default function Nav() {


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
    <nav className="flex justify-end items-center mb-6 bg-linear-to-r from-[#0a246a] to-[#3a6ea5] px-4 py-2 rounded-b-md shadow">
      <Link to="/" className='text-white hover:underline'>
        Home
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center">
          {username && (
            <span className="mx-2 text-sm text-white bg-blue-500 px-2 py-1 rounded">
              Logged in as <strong>{username}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="hover:underline text-white"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className="mx-4 text-white hover:underline">
          Login
        </Link>
      )}
    </nav>
  )
}