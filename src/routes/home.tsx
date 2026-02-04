import { useEffect, useState } from 'react'
import type { Advice } from '../interfaces/interface.advice'
import { fetchAllAdvices, deleteAdviceById, createAdvice, addReply, deleteReply } from '../modules/module.advice'
import Nav from '../components/nav'


export default function Home() {
  
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    anonymous: false,
  })
  const [reply, setReply] = useState<Record<string, string>>({})
  
  async function handleDelete(_id: string) {
    await deleteAdviceById(_id)
    setAdvices(prev => prev.filter(a => a._id !== _id))
  }

  async function handleCreate() {
    try {
      console.log('Creating advice with payload:', form)
      const created = await createAdvice(form)
      console.log('Created advice:', created)
      setAdvices(prev => [created, ...prev])
      setIsModalOpen(false)
      setForm({ title: '', content: '', anonymous: false })
    } catch (err) {
      console.error('Create advice failed:', err)
      alert('Failed to create advice. Check console / network tab.')
    }
  }

  async function handleAddReply(adviceId: string) {
    const content = reply[adviceId]?.trim()
    if (!content) return

    const updated = await addReply(adviceId, { content, anonymous: true })
    setAdvices(prev => prev.map(a => (a._id === adviceId ? updated : a)))
    setReply(prev => ({ ...prev, [adviceId]: '' }))
  }

  async function handleDeleteReply(adviceId: string, replyId: string) {
    await deleteReply(adviceId, replyId)
    setAdvices(prev => prev.map(a =>
      a._id === adviceId
        ? { ...a, replies: a.replies.filter(r => r._id !== replyId) }
        : a
    ))
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
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
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
                {advice.anonymous ? 'Posted anonymously' : `Posted by ${advice._createdBy}`}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {new Date(advice.createdAt).toLocaleString()}
              </div>

              {advice.replies && advice.replies.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-sm font-semibold mb-2">Replies</h3>
                  <ul className="space-y-2">
                    {advice.replies.map((reply) => (
                      <li key={reply._id} className="text-sm text-gray-700 bg-gray-50 p-2 rounded flex items-start justify-between gap-2">
                        <div>
                          <p>{reply.content}</p>
                          <div className="mt-1 text-xs text-gray-500">
                            {reply.anonymous ? 'Anonymous' : reply._createdBy ? `User ${reply._createdBy}` : 'User'}
                            {' · '}
                            {new Date(reply.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReply(advice._id, reply._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete reply
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Write a reply..."
                  value={reply[advice._id] || ''}
                  onChange={e => setReply(prev => ({ ...prev, [advice._id]: e.target.value }))}
                />
                <button
                  onClick={() => handleAddReply(advice._id)}
                  className="text-sm px-3 py-1 rounded bg-gray-900 text-white hover:bg-black"
                >
                  Reply
                </button>
              </div>

              <button
                onClick={() => handleDelete(advice._id)}
                className="mt-3 text-sm text-red-600 hover:text-red-800"
              >
                Delete advice
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Advice</h2>

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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}