import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import AdvicePreviewCard from '../components/AdvicePreviewCard'
import type { Advice } from '../interfaces/interface.advice'
import { fetchAllAdvices } from '../modules/module.advice'

export default function MyPosts() {
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllAdvices()
        // Backend already sets _isMine, so just filter
        setAdvices(data.filter(a => a._isMine))
      } catch {
        setError('Could not load your posts')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div
      className="mx-auto min-h-screen px-4 py-4"
      style={{
        backgroundImage: "url('https://cdn.wallpapersafari.com/28/82/OXgnsy.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="min-h-screen bg-[#d4d0c8]/ backdrop-blur-[0px] p-2">
        <h1 className="flex flex-col gap-1 rounded-t-xl bg-linear-to-r from-[#0b5bd3] to-[#79b1ff] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
          <span className="text-2xl font-semibold text-white">Windows Vista Troubleshooting</span>
          <span className="text-xs text-white/90">My posts</span>
        </h1>

        <Nav />

        {isLoading && (
          <div className="my-10 mx-auto max-w-xl rounded-xl bg-white/60 p-6 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-md">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#79b1ff] border-t-transparent"></div>
            <h3 className="mb-1 text-sm font-semibold text-[#0b3d91]">Loading your posts…</h3>
          </div>
        )}

        {error && (
          <div className="my-6 mx-auto max-w-xl rounded-xl bg-red-100 p-4 text-center text-sm text-red-700 shadow ring-1 ring-red-300">
            {error}
          </div>
        )}

        {!isLoading && !error && advices.length === 0 && (
          <div className="my-6 mx-auto max-w-xl rounded-xl bg-yellow-100 p-4 text-center text-sm text-yellow-800 shadow ring-1 ring-yellow-300">
            You have not posted anything yet.
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-4">
          {advices.map(a => (
            <AdvicePreviewCard key={a._id} advice={a} />
          ))}
        </div>
      </div>
    </div>
  )
}