import { useEffect, useState } from 'react'
import type { Advice } from '../interfaces/interface.advice'
import { fetchAllAdvices, deleteAdviceById, createAdvice, addReply, deleteReply, updateAdviceById, updateReplyById } from '../modules/module.advice'
import Nav from '../components/nav'
import axios from 'axios'

type ApiErrorBody = { message?: string }

type PopulatedUser = { _id: string; username: string }

function isPopulatedUser(v: unknown): v is PopulatedUser {
  return (
    typeof v === 'object' &&
    v !== null &&
    '_id' in v &&
    typeof (v as Record<string, unknown>)._id === 'string' &&
    'username' in v
  )
}

function getUsername(v: unknown, anonymous?: boolean): string {
  if (anonymous) return 'Anonymous'
  if (isPopulatedUser(v)) return v.username
  if (typeof v === 'string' && v) return `User ${v}`
  return 'User'
}

type JwtPayload = { id?: string }

function getMyUserId(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload
    return payload?.id ?? null
  } catch {
    return null
  }
}

function getOwnerId(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v !== null && '_id' in v) {
    return String((v as { _id: unknown })._id)
  }
  return null
}

function isOwner(createdBy: unknown): boolean {
  const me = getMyUserId()
  const ownerId = getOwnerId(createdBy)
  return Boolean(me && ownerId && me === ownerId)
}



export default function Home() {
  
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    anonymous: false,
  })
  const [reply, setReply] = useState<Record<string, string>>({})
  const [replyAnonymous, setReplyAnonymous] = useState<Record<string, boolean>>({})
  const [createError, setCreateError] = useState<string | null>(null)
  const [replyError, setReplyError] = useState<Record<string, string | null>>({})
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingReply, setEditingReply] = useState<{ adviceId: string; replyId: string } | null>(null)
  const [replyEdit, setReplyEdit] = useState<Record<string, string>>({})
  const [replyEditAnonymous, setReplyEditAnonymous] = useState<Record<string, boolean>>({})
  

  function renderAuthor(advice: Advice) {
    return advice.anonymous ? 'Posted anonymously' : `Posted by ${getUsername(advice._createdBy)}`
  }

  function renderReplies(advice: Advice) {
    if (!advice.replies?.length) return null
    return (
      <div className="mt-4 border-t pt-3">
        <h3 className="text-sm font-semibold mb-2">Replies</h3>
        <ul className="space-y-2">
          {advice.replies.map(replyItem => {
            const isEditing = editingReply?.adviceId === advice._id && editingReply?.replyId === replyItem._id

            return (
              <li key={replyItem._id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {!isEditing ? (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p>{replyItem.content}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        {getUsername(replyItem._createdBy, replyItem.anonymous)} · {new Date(replyItem.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {isAuthenticated && isOwner(replyItem._createdBy) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReply({ adviceId: advice._id, replyId: replyItem._id })
                            setReplyEdit(prev => ({ ...prev, [replyItem._id]: replyItem.content }))
                            setReplyEditAnonymous(prev => ({ ...prev, [replyItem._id]: !!replyItem.anonymous }))
                          }}
                          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReply(advice._id, replyItem._id)}
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
                      onChange={e => setReplyEdit(prev => ({ ...prev, [replyItem._id]: e.target.value }))}
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={!!replyEditAnonymous[replyItem._id]}
                        onChange={e => setReplyEditAnonymous(prev => ({ ...prev, [replyItem._id]: e.target.checked }))}
                      />
                      Reply anonymously
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateReply(advice._id, replyItem._id)}
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
    )
  }

  function renderActions(advice: Advice) {
    if (!isAuthenticated || !isOwner(advice._createdBy)) return null
    return (
      <div className="mt-3 flex gap-3">
        <button
          onClick={() => {
            setEditingId(advice._id)
            setForm({ title: advice.title, content: advice.content, anonymous: advice.anonymous })
            setIsModalOpen(true)
          }}
          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
        >
          Edit advice
        </button>
        <button
          onClick={() => handleDelete(advice._id)}
          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
        >
          Delete advice
        </button>
      </div>
    )
  }

  async function handleDelete(_id: string) {
    const ok = window.confirm('Are you sure you want to delete this post? This cannot be undone.')
    if (!ok) return

    try {
      await deleteAdviceById(_id)
      setAdvices(prev => prev.filter(a => a._id !== _id))
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        alert('You can only delete your own posts.')
        return
      }
      alert('Failed to delete post.')
      console.error(err)
    }
  }

  async function handleCreate() {
    setCreateError(null)

    const title = form.title.trim()
    const content = form.content.trim()

    if (title.length < 3) {
      setCreateError('Title must be at least 3 characters')
      return
    }

    if (content.length < 3) {
      setCreateError('Content must be at least 3 characters')
      return
    }

    try {
      console.log('Creating advice with payload:', form)
      const created = await createAdvice({ ...form, title, content })
      console.log('Created advice:', created)
      setAdvices(prev => [created, ...prev])
      setIsModalOpen(false)
      setForm({ title: '', content: '', anonymous: false })
      setCreateError(null)
    } catch (err: unknown) {
      console.error('Create advice failed:', err)
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorBody | undefined)?.message
        : undefined
      setCreateError(msg || 'Failed to create advice. Check your input.')
    }
  }

  async function handleUpdate() {
    if (!editingId) return

    setCreateError(null)
    const title = form.title.trim()
    const content = form.content.trim()

    if (title.length < 3) {
      setCreateError('Title must be at least 3 characters')
      return
    }

    if (content.length < 3) {
      setCreateError('Content must be at least 3 characters')
      return
    }

    try {
      const updated = await updateAdviceById(editingId, { title, content, anonymous: form.anonymous })
      setAdvices(prev => prev.map(a => (a._id === editingId ? updated : a)))
      setIsModalOpen(false)
      setEditingId(null)
      setForm({ title: '', content: '', anonymous: false })
      setCreateError(null)
    } catch (err: unknown) {
      console.error('Update advice failed:', err)
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorBody | undefined)?.message
        : undefined
      setCreateError(msg || 'Failed to update advice. Check your input.')
    }
  }

  async function handleAddReply(adviceId: string) {
    const content = reply[adviceId]?.trim()
    if (!content || content.length < 3) {
      setReplyError(prev => ({ ...prev, [adviceId]: 'Reply must be at least 3 characters' }))
      return
    }

    try {
      const anonymous = !!replyAnonymous[adviceId]
      const updated = await addReply(adviceId, { content, anonymous })
      setAdvices(prev => prev.map(a => (a._id === adviceId ? updated : a)))
      setReply(prev => ({ ...prev, [adviceId]: '' }))
      setReplyAnonymous(prev => ({ ...prev, [adviceId]: false }))
      setReplyError(prev => ({ ...prev, [adviceId]: null }))
    } catch (err: unknown) {
      console.error('Add reply failed:', err)
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorBody | undefined)?.message
        : undefined
      setReplyError(prev => ({ ...prev, [adviceId]: msg || 'Failed to add reply' }))
    }
  }

  async function handleDeleteReply(adviceId: string, replyId: string) {
    const ok = window.confirm('Are you sure you want to delete this reply?')
    if (!ok) return

    try {
      await deleteReply(adviceId, replyId)
      setAdvices(prev => prev.map(a =>
        a._id === adviceId
          ? { ...a, replies: a.replies.filter(r => r._id !== replyId) }
          : a
      ))
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        alert('You can only delete your own replies.')
        return
      }
      alert('Failed to delete reply.')
      console.error(err)
    }
  }

  async function handleUpdateReply(adviceId: string, replyId: string) {
    const content = replyEdit[replyId]?.trim()
    if (!content || content.length < 3) {
      setReplyError(prev => ({ ...prev, [adviceId]: 'Reply must be at least 3 characters' }))
      return
    }

    try {
      const anonymous = !!replyEditAnonymous[replyId]
      const updated = await updateReplyById(adviceId, replyId, { content, anonymous })
      setAdvices(prev => prev.map(a => (a._id === adviceId ? updated : a)))
      setEditingReply(null)
      setReplyEdit(prev => ({ ...prev, [replyId]: '' }))
      setReplyEditAnonymous(prev => ({ ...prev, [replyId]: false }))
      setReplyError(prev => ({ ...prev, [adviceId]: null }))
    } catch (err: unknown) {
      console.error('Update reply failed:', err)
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorBody | undefined)?.message
        : undefined
      setReplyError(prev => ({ ...prev, [adviceId]: msg || 'Failed to update reply' }))
    }
  }
  
  useEffect(() => {
    fetchAllAdvices()
      .then(setAdvices)
  }, [])

  return (
    <div
      className="mx-auto min-h-screen px-4 py-4"
      style={{
        backgroundImage: "url('https://cdn.wallpapersafari.com/28/82/OXgnsy.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-[#d4d0c8]/ backdrop-blur-[0px] p-2">
     
      <h1 className="flex justify-start text-3xl items-center rounded-t-xl bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
        Advice Board - Windows Vista
      </h1>

      <Nav />
      
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isAuthenticated}
        className="mb-4 rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] px-3 py-1 text-sm text-black shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white disabled:opacity-50"
      >
        {isAuthenticated ? 'Ask a question or give an advice' : 'Login to ask a question or give an advice'}
      </button>

      {advices.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advices.map(advice => (
            <div
              key={advice._id}
              className="relative overflow-hidden rounded-xl bg-white/40 p-4 shadow-xl ring-1 ring-white/40 backdrop-blur-md"
            >
              <h2 className="mb-2 rounded-md bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-3 py-2 text-sm font-semibold text-white shadow">
                {advice.title}
              </h2>
              <div className="mt-2">
                {renderActions(advice)}
              </div>

              <p className="mt-2 text-sm text-slate-900">
                {advice.content}
              </p>

              <div className="mt-3 text-sm text-slate-600">{renderAuthor(advice)}</div>

              <div className="mt-1 text-xs text-slate-500">
                {new Date(advice.createdAt).toLocaleString()}
              </div>
              {renderReplies(advice)}

              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 text-sm focus:outline-none"
                    placeholder={isAuthenticated ? 'Write a reply...' : 'Login to reply'}
                    value={reply[advice._id] || ''}
                    onChange={e => setReply(prev => ({ ...prev, [advice._id]: e.target.value }))}
                    disabled={!isAuthenticated}
                  />
                  <button
                    onClick={() => handleAddReply(advice._id)}
                    disabled={!isAuthenticated}
                    className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
                  >
                    Reply
                  </button>
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={!!replyAnonymous[advice._id]}
                    onChange={e => setReplyAnonymous(prev => ({ ...prev, [advice._id]: e.target.checked }))}
                    disabled={!isAuthenticated}
                  />
                  Reply anonymously
                </label>
                {replyError[advice._id] && (
                  <p className="mt-1 text-xs text-red-600">{replyError[advice._id]}</p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] p-3 shadow">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit question or advice' : 'Ask question or give advice'}</h2>

            <input
              className="mb-2 w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white p-1 text-sm focus:outline-none"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              className="mb-2 w-full rounded-none border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white p-1 text-sm focus:outline-none"
              placeholder="Content"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={e => setForm({ ...form, anonymous: e.target.checked })}
              />
              Post anonymously
            </label>

            {createError && (
              <p className="mb-3 text-sm text-red-600">{createError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                  setForm({ title: '', content: '', anonymous: false })
                  setCreateError(null)
                }}
                className="rounded-none border border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#e4e2dc] px-3 py-1 text-sm shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
              >
                {editingId ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}