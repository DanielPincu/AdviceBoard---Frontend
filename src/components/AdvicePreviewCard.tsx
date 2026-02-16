import { useNavigate, Link } from 'react-router-dom'
import type { Advice } from '../interfaces/interface.advice'
import { getUsername } from '../utils/home.logic'

interface Props {
  advice: Advice
}

export default function AdvicePreviewCard({ advice }: Props) {
  const navigate = useNavigate()

  const userId =
    advice._createdBy && typeof advice._createdBy === 'object' && '_id' in advice._createdBy
      ? String((advice._createdBy as { _id: string })._id)
      : null

  return (
    <div className="relative overflow-hidden rounded-xl bg-white/40 p-4 shadow-xl ring-1 ring-white/40 backdrop-blur-md">
      <h2 className="mb-2 rounded-md bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-3 py-2 text-sm font-semibold text-white shadow">
        {advice.title}
      </h2>

      <p className="mt-2 line-clamp-3 text-sm text-slate-900">
        {advice.content}
      </p>

      <div className="mt-3 text-sm text-slate-600">
        {advice.anonymous ? (
          'Reported anonymously'
        ) : userId ? (
          <span>
            Reported by{' '}
            <Link
              to={`/user/${userId}`}
              className="text-blue-700 underline hover:text-blue-900"
            >
              {getUsername(advice._createdBy, false)}
            </Link>
          </span>
        ) : (
          `Reported by ${getUsername(advice._createdBy, false)}`
        )}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {new Date(advice.createdAt).toLocaleString()}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => navigate(`/advice/${advice._id}`)}
          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
        >
          Open
        </button>
      </div>
    </div>
  )
}