import Nav from '../components/nav'
import { useState } from 'react'

export default function About() {
  // Reactive state (Vue: ref)
  const [count, setCount] = useState(0)

  return (
    <div className="mx-4">
      <h1 className="mx-4 text-2xl font-bold title">
        About Page
      </h1>

      {/* Navigation */}
      <Nav />

      {/* Counter */}
      <div className="mt-8 mx-4">
        <div className="text-lg mb-2">
          Counter: {count}
        </div>

        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800"
        >
          Increment
        </button>
      </div>
    </div>
  )
}
