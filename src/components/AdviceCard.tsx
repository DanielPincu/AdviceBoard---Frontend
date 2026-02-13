import type { Advice } from '../interfaces/interface.advice'

type EditingReply = { adviceId: string; replyId: string } | null

interface Props {
  advice: Advice
  isAuthenticated: boolean
  isOwner: (createdBy: unknown) => boolean
  getUsername: (v: unknown, anonymous?: boolean) => string

  editingReply: EditingReply
  setEditingReply: (v: EditingReply) => void

  replyEdit: Record<string, string>
  setReplyEdit: (
    v: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)
  ) => void

  replyEditAnonymous: Record<string, boolean>
  setReplyEditAnonymous: (
    v: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void

  onEditAdvice: (advice: Advice) => void
  onDeleteAdvice: (id: string) => void

  onAddReply: (adviceId: string) => void
  onDeleteReply: (adviceId: string, replyId: string) => void
  onUpdateReply: (adviceId: string, replyId: string) => void

  replyValue: string
  setReplyValue: (v: string) => void

  replyAnonymous: boolean
  setReplyAnonymous: (v: boolean) => void

  replyError: string | null
}

export default function AdviceCard({
  advice,
  isAuthenticated,
  isOwner,
  getUsername,
  editingReply,
  setEditingReply,
  replyEdit,
  setReplyEdit,
  replyEditAnonymous,
  setReplyEditAnonymous,
  onEditAdvice,
  onDeleteAdvice,
  onAddReply,
  onDeleteReply,
  onUpdateReply,
  replyValue,
  setReplyValue,
  replyAnonymous,
  setReplyAnonymous,
  replyError,
}: Props) {
  const renderAuthor = () => {
    return advice.anonymous
      ? 'Reported anonymously'
      : `Reported by ${getUsername(advice._createdBy)}`
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-white/40 p-4 shadow-xl ring-1 ring-white/40 backdrop-blur-md">
      <h2 className="mb-2 rounded-md bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-3 py-2 text-sm font-semibold text-white shadow">
        {advice.title}
      </h2>

      {isAuthenticated && isOwner(advice._createdBy) && (
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => onEditAdvice(advice)}
            className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
          >
            Edit advice
          </button>
          <button
            onClick={() => onDeleteAdvice(advice._id)}
            className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
          >
            Delete advice
          </button>
        </div>
      )}

      <p className="mt-2 text-sm text-slate-900">{advice.content}</p>

      <div className="mt-3 text-sm text-slate-600">{renderAuthor()}</div>

      <div className="mt-1 text-xs text-slate-500">
        {new Date(advice.createdAt).toLocaleString()}
      </div>

      {advice.replies?.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="mb-2 text-sm font-semibold">Possible solutions</h3>
          <ul className="space-y-2">
            {advice.replies.map(replyItem => {
              const isEditing =
                editingReply?.adviceId === advice._id &&
                editingReply?.replyId === replyItem._id

              return (
                <li key={replyItem._id} className="rounded bg-gray-50 p-2 text-sm text-gray-700">
                  {!isEditing ? (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p>{replyItem.content}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {getUsername(replyItem._createdBy, replyItem.anonymous)} ·{' '}
                          {new Date(replyItem.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {isAuthenticated && isOwner(replyItem._createdBy) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingReply({ adviceId: advice._id, replyId: replyItem._id })
                              setReplyEdit(prev => ({ ...prev, [replyItem._id]: replyItem.content }))
                              setReplyEditAnonymous(prev => ({
                                ...prev,
                                [replyItem._id]: !!replyItem.anonymous,
                              }))
                            }}
                            className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteReply(advice._id, replyItem._id)}
                            className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white p-1 text-sm focus:outline-none"
                        value={replyEdit[replyItem._id] || ''}
                        onChange={e =>
                          setReplyEdit(prev => ({ ...prev, [replyItem._id]: e.target.value }))
                        }
                      />
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={!!replyEditAnonymous[replyItem._id]}
                          onChange={e =>
                            setReplyEditAnonymous(prev => ({
                              ...prev,
                              [replyItem._id]: e.target.checked,
                            }))
                          }
                        />
                        Reply anonymously
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateReply(advice._id, replyItem._id)}
                          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReply(null)}
                          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 text-sm focus:outline-none"
            placeholder={isAuthenticated ? 'Add a possible solution…' : 'Login to add a solution'}
            value={replyValue}
            onChange={e => setReplyValue(e.target.value)}
            disabled={!isAuthenticated}
          />
          <button
            onClick={() => onAddReply(advice._id)}
            disabled={!isAuthenticated}
            className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
          >
            {isAuthenticated ? 'Add solution' : 'Login to add solution'}
          </button>
        </div>

        <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={replyAnonymous}
            onChange={e => setReplyAnonymous(e.target.checked)}
            disabled={!isAuthenticated}
          />
          Post solution anonymously
        </label>

        {replyError && <p className="mt-1 text-xs text-red-600">{replyError}</p>}
      </div>
    </div>
  )
}