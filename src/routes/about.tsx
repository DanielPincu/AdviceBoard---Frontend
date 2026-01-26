import { Link } from 'react-router-dom';

export default function About() {
  return (
  <div className="mx-4">

    <h1 className="mx-4 text-2xl font-bold title">About Page</h1>
    <div className="flex justify-end items-center">
      
      <Link
        to="/"
        className="text-red-900 hover:underline mx-4"
      >
        Home
      </Link>
    
      
      <Link
        to="/about"
        className="text-red-900 hover:underline mx-4"
      >
        About
      </Link>

      <br />

      <Link
        to="/contact"
        className="text-red-900 hover:underline mx-4"
      >
        Contact
      </Link>
    </div>
  </div>

  )
  
}
