import { useEffect, useState } from 'react'
import type { Advice } from '../interfaces/interface.advice'
import { fetchAllAdvices, deleteAdviceById, createAdvice, addReply, deleteReply, updateAdviceById } from '../modules/module.advice'
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

function isOwner(v: unknown, myUserId: string | null): boolean {
  if (!myUserId) return false
  if (isPopulatedUser(v)) return v._id === myUserId
  if (typeof v === 'string') return v === myUserId
  return false
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
  
  function getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { id?: string }
      return payload?.id ?? null
    } catch {
      return null
    }
  }

  const myUserId = getUserIdFromToken()

  async function handleDelete(_id: string) {
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
  
  useEffect(() => {
    fetchAllAdvices()
      .then(setAdvices)
  }, [])

  return (
    <div className="mx-4">
     
      <h1 className="mx-4 text-2xl font-bold">
        Home Page
      </h1>

      <Nav />
      
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isAuthenticated}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Create Advice
      </button>

      {advices.length > 0 && (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {advices.map(advice => (
            <div
              key={advice._id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">
                {advice.title}
              </h2>

              <p className="mt-2 text-gray-700">
                {advice.content}
              </p>

              <div className="mt-3 text-sm text-gray-500">
                {advice.anonymous ? 'Posted anonymously' : `Posted by ${getUsername(advice._createdBy)}`}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {new Date(advice.createdAt).toLocaleString()}
              </div>

              {advice.replies && advice.replies.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-sm font-semibold mb-2">Replies</h3>
                  <ul className="space-y-2">
                    {advice.replies.map((replyItem) => (
                      <li key={replyItem._id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded flex items-start justify-between gap-2">
                        <div>
                          <p>{replyItem.content}</p>
                          <div className="mt-1 text-xs text-gray-500">
                            {getUsername(replyItem._createdBy, replyItem.anonymous)} {' · '}
                            {new Date(replyItem.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {isOwner(replyItem._createdBy, myUserId) && (
                          <button
                            onClick={() => handleDeleteReply(advice._id, replyItem._id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Delete reply
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    placeholder={isAuthenticated ? 'Write a reply...' : 'Login to reply'}
                    value={reply[advice._id] || ''}
                    onChange={e => setReply(prev => ({ ...prev, [advice._id]: e.target.value }))}
                    disabled={!isAuthenticated}
                  />
                  <button
                    onClick={() => handleAddReply(advice._id)}
                    disabled={!isAuthenticated}
                    className="text-sm px-3 py-1 rounded bg-gray-900 text-white hover:bg-black disabled:opacity-50"
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

              {(() => {
                const isMine = isOwner(advice._createdBy, myUserId)

                return (
                  <div className="mt-3 flex gap-3">
                    {isMine && (
                      <button
                        onClick={() => {
                          setEditingId(advice._id)
                          setForm({ title: advice.title, content: advice.content, anonymous: advice.anonymous })
                          setIsModalOpen(true)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit advice
                      </button>
                    )}
                    {isMine && (
                      <button
                        onClick={() => handleDelete(advice._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete advice
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Advice' : 'Create Advice'}</h2>

            <input
              className="w-full border p-2 mb-3"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              className="w-full border p-2 mb-3"
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
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {editingId ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}