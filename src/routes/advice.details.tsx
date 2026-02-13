import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Advice } from '../interfaces/interface.advice'
import AdviceCard from '../components/AdviceCard'
import Nav from '../components/Nav'
import AdviceModal from '../components/AdviceModal'
import {
  getUsername,
  isOwner,
  handleDeleteAdvice,
  handleAddReplyToAdvice,
  handleDeleteReplyFromAdvice,
  handleUpdateReplyOnAdvice,
  handleUpdateAdvice,
} from '../utils/home.logic'
import { fetchAdviceById } from '../modules/module.advice'

export default function AdviceDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [advice, setAdvice] = useState<Advice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // reply state (same pattern as Home, but scoped to one advice)
  const [reply, setReply] = useState<string>('')
  const [replyAnonymous, setReplyAnonymous] = useState<boolean>(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const [editingReply, setEditingReply] = useState<{ adviceId: string; replyId: string } | null>(null)
  const [replyEdit, setReplyEdit] = useState<Record<string, string>>({})
  const [replyEditAnonymous, setReplyEditAnonymous] = useState<Record<string, boolean>>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', anonymous: false })
  const [createError, setCreateError] = useState<string | null>(null)

  const isAuthenticated = Boolean(localStorage.getItem('token'))

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        const data = await fetchAdviceById(id)
        setAdvice(data)
        setIsLoading(false)
      } catch (e) {
        console.error(e)
        setError('Failed to load advice')
        setIsLoading(false)
      }
    }

    load()
  }, [id])

  if (isLoading) {
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
            <span className="text-2xl font-semibold text-white">Windows Troubleshooting</span>
            <span className="text-xs text-white/90">Details</span>
          </h1>

          <Nav />

          <div className="my-10 mx-auto max-w-xl rounded-xl bg-white/60 p-6 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-md">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#79b1ff] border-t-transparent"></div>
            <h3 className="mb-1 text-sm font-semibold text-[#0b3d91]">Loading…</h3>
            <p className="text-xs text-slate-600">Fetching details...</p>
          </div>
        </div>
      </div>
    )
  }
  if (error || !advice) return <div className="p-4 text-red-600">{error || 'Not found'}</div>

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
          <span className="text-2xl font-semibold text-white">Windows Troubleshooting</span>
          <span className="text-xs text-white/90">Details</span>
        </h1>

        <Nav />

        <button
          onClick={() => navigate(-1)}
          className="mb-4 rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-2 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff]"
        >
          ← Back
        </button>

        <AdviceCard
          advice={advice}
          isAuthenticated={isAuthenticated}
          isOwner={isOwner}
          getUsername={getUsername}
          editingReply={editingReply}
          setEditingReply={setEditingReply}
          replyEdit={replyEdit}
          setReplyEdit={setReplyEdit}
          replyEditAnonymous={replyEditAnonymous}
          setReplyEditAnonymous={setReplyEditAnonymous}
          onEditAdvice={(a) => {
            setForm({ title: a.title, content: a.content, anonymous: a.anonymous })
            setIsModalOpen(true)
          }}
          onDeleteAdvice={async (adviceId) => {
            const deletedId = await handleDeleteAdvice(adviceId)
            if (deletedId) navigate('/')
          }}
          onAddReply={async (adviceId) => {
            try {
              const updated = await handleAddReplyToAdvice(adviceId, reply, replyAnonymous)
              setAdvice(updated)
              setReply('')
              setReplyAnonymous(false)
              setReplyError(null)
            } catch (e) {
              setReplyError((e as Error).message)
            }
          }}
          onDeleteReply={async (adviceId, replyId) => {
            try {
              await handleDeleteReplyFromAdvice(adviceId, replyId)
              setAdvice(prev =>
                prev
                  ? { ...prev, replies: prev.replies.filter(r => r._id !== replyId) }
                  : prev
              )
            } catch (e) {
              console.error(e)
            }
          }}
          onUpdateReply={async (adviceId, replyId) => {
            try {
              const updated = await handleUpdateReplyOnAdvice(
                adviceId,
                replyId,
                replyEdit[replyId] || '',
                !!replyEditAnonymous[replyId]
              )
              setAdvice(updated)
              setEditingReply(null)
              setReplyEdit(prev => ({ ...prev, [replyId]: '' }))
              setReplyEditAnonymous(prev => ({ ...prev, [replyId]: false }))
              setReplyError(null)
            } catch (e) {
              setReplyError((e as Error).message)
            }
          }}
          replyValue={reply}
          setReplyValue={setReply}
          replyAnonymous={replyAnonymous}
          setReplyAnonymous={setReplyAnonymous}
          replyError={replyError}
        />
        <AdviceModal
          isOpen={isModalOpen}
          editingId={advice._id}
          form={form}
          setForm={setForm}
          createError={createError}
          onCancel={() => {
            setIsModalOpen(false)
            setCreateError(null)
          }}
          onSubmit={async () => {
            try {
              const updated = await handleUpdateAdvice(advice._id, form)
              setAdvice(updated)
              setIsModalOpen(false)
              setCreateError(null)
            } catch (e) {
              setCreateError((e as Error).message)
            }
          }}
        />
      </div>
    </div>
  )
}