import { useEffect, useState } from 'react'
import type { Advice } from '../interfaces/interface.advice'
import { fetchAllAdvices, deleteAdviceById, createAdvice } from '../modules/module.advice'
import Nav from '../components/nav'


export default function Home() {
  
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    anonymous: false,
  })
  
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
              <button
                onClick={() => handleDelete(advice._id)}
                className="mt-3 text-sm text-red-600 hover:text-red-800"
              >
                Delete
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