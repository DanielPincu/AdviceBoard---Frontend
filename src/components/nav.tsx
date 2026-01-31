import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()

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

      <Link to="/contact" className={linkClass('/contact')}>
        Contact
      </Link>
    </nav>
  )
}