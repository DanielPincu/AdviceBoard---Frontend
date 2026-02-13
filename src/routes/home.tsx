import { useEffect, useState } from 'react'
import type { Advice } from '../interfaces/interface.advice'
import Nav from '../components/Nav'
import AdviceCard from '../components/AdviceCard'
import AdviceModal from '../components/AdviceModal'
import {
  getUsername,
  isOwner,
  loadAdvices,
  handleDeleteAdvice,
  handleCreateAdvice,
  handleUpdateAdvice,
  handleAddReplyToAdvice,
  handleDeleteReplyFromAdvice,
  handleUpdateReplyOnAdvice,
} from '../utils/home.logic'



export default function Home() {
  
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasLoadError, setHasLoadError] = useState<boolean>(false)
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
  


  useEffect(() => {
    let mounted = true
    let retryTimer: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      if (!mounted) return
      setIsLoading(true)
      try {
        await loadAdvices(setAdvices)
        if (!mounted) return
        setHasLoadError(false)
        setIsLoading(false)
        if (retryTimer) {
          clearInterval(retryTimer)
          retryTimer = null
        }
      } catch (err) {
        console.error('Failed to load advices:', err)
        if (!mounted) return
        // Keep spinner visible and mark load error
        setHasLoadError(true)
        setIsLoading(true)
        // Start retry loop if not already running
        if (!retryTimer) {
          retryTimer = setInterval(load, 3000) // retry every 3s
        }
      }
    }

    load()

    return () => {
      mounted = false
      if (retryTimer) clearInterval(retryTimer)
    }
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
     
        <h1 className="flex flex-col gap-1 rounded-t-xl bg-linear-to-r from-[#0b5bd3] to-[#79b1ff] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
        <span className="text-2xl font-semibold text-white">Windows Troubleshooting</span>
        <span className="text-xs text-white/90">Find solutions to common problems</span>
      </h1>

      <Nav />
      
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isAuthenticated}
        className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-3 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px
        mb-5"
      >
        {isAuthenticated ? 'Create troubleshooting request' : 'Login to create troubleshooting request'}
      </button>

      {(isLoading || hasLoadError) && (
        <div className="my-10 mx-auto max-w-xl rounded-xl bg-white/60 p-6 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-md">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#79b1ff] border-t-transparent"></div>
          <h3 className="mb-1 text-sm font-semibold text-[#0b3d91]">
            Windows Troubleshooter is loading…
          </h3>
          <p className="text-xs text-slate-600">
            {hasLoadError ? 'Cannot reach the service. Retrying…' : 'Detecting issues and retrieving solutions'}
          </p>
        </div>
      )}


      {!isLoading && advices.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advices.map(advice => (
            <AdviceCard
              key={advice._id}
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
              onEditAdvice={(a: Advice) => {
                setEditingId(a._id)
                setForm({ title: a.title, content: a.content, anonymous: a.anonymous })
                setIsModalOpen(true)
              }}
              onDeleteAdvice={(id) => handleDeleteAdvice(id, setAdvices)}
              onAddReply={(adviceId) =>
                handleAddReplyToAdvice(
                  adviceId,
                  reply[adviceId] || '',
                  !!replyAnonymous[adviceId],
                  setAdvices,
                  (msg) => setReplyError(prev => ({ ...prev, [adviceId]: msg }))
                )
              }
              onDeleteReply={(adviceId, replyId) => handleDeleteReplyFromAdvice(adviceId, replyId, setAdvices)}
              onUpdateReply={async (adviceId, replyId) => {
                await handleUpdateReplyOnAdvice(
                  adviceId,
                  replyId,
                  replyEdit[replyId] || '',
                  !!replyEditAnonymous[replyId],
                  setAdvices,
                  (msg) => setReplyError(prev => ({ ...prev, [adviceId]: msg }))
                )
                setEditingReply(null)
                setReplyEdit(prev => ({ ...prev, [replyId]: '' }))
                setReplyEditAnonymous(prev => ({ ...prev, [replyId]: false }))
              }}
              replyValue={reply[advice._id] || ''}
              setReplyValue={(v: string) => setReply(prev => ({ ...prev, [advice._id]: v }))}
              replyAnonymous={!!replyAnonymous[advice._id]}
              setReplyAnonymous={(v: boolean) => setReplyAnonymous(prev => ({ ...prev, [advice._id]: v }))}
              replyError={replyError[advice._id] || null}
            />
          ))}
        </div>
      )}

      <AdviceModal
        isOpen={isModalOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        createError={createError}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingId(null)
          setForm({ title: '', content: '', anonymous: false })
          setCreateError(null)
        }}
        onSubmit={() =>
          editingId
            ? handleUpdateAdvice(
                editingId,
                form,
                setAdvices,
                () => {
                  setIsModalOpen(false)
                  setEditingId(null)
                  setForm({ title: '', content: '', anonymous: false })
                  setCreateError(null)
                },
                setCreateError
              )
            : handleCreateAdvice(
                form,
                setAdvices,
                () => {
                  setIsModalOpen(false)
                  setForm({ title: '', content: '', anonymous: false })
                  setCreateError(null)
                },
                setCreateError
              )
        }
      />
      </div>
    </div>
  )
}