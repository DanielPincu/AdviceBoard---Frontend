import { useEffect, useState } from 'react'
import axios from 'axios'
import type { Advice } from '../interfaces/interface.advice'
import Nav from '../components/Nav'
import AdvicePreviewCard from '../components/AdvicePreviewCard'
import AdviceModal from '../components/AdviceModal'
import { loadAdvices, handleCreateAdvice, handleUpdateAdvice } from '../utils/home.logic'



export default function Home() {
  
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasLoadError, setHasLoadError] = useState<boolean>(false)
  const [isUnauthError, setIsUnauthError] = useState<boolean>(false)
  const [showSpinner, setShowSpinner] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    anonymous: false,
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [editingId, setEditingId] = useState<string | null>(null)
  


  useEffect(() => {
    let mounted = true
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let spinnerTimer: ReturnType<typeof setTimeout> | null = null

    const load = async () => {
      if (!mounted) return

      // reset flags before each attempt
      setIsLoading(true)
      setHasLoadError(false)
      setIsUnauthError(false)

      // delay spinner to avoid flicker when navigating
      if (!spinnerTimer) {
        spinnerTimer = setTimeout(() => {
          if (mounted) setShowSpinner(true)
        }, 400)
      }

      try {
        const data = await loadAdvices()
        if (!mounted) return

        setAdvices(data)
        setIsLoading(false)
        setHasLoadError(false)
        setIsUnauthError(false)
        setShowSpinner(false)

        if (spinnerTimer) {
          clearTimeout(spinnerTimer)
          spinnerTimer = null
        }
        if (retryTimer) {
          clearTimeout(retryTimer)
          retryTimer = null
        }
      } catch (err: unknown) {
        if (!mounted) return

        let status: number | undefined
        if (axios.isAxiosError(err)) {
          status = err.response?.status
        }

        const unauth = status === 401 || status === 403

        if (unauth) {
          // auth error: show auth message, do NOT retry
          setIsUnauthError(true)
          setHasLoadError(false)
          setIsLoading(false)
          setShowSpinner(false)

          if (spinnerTimer) {
            clearTimeout(spinnerTimer)
            spinnerTimer = null
          }
          if (retryTimer) {
            clearTimeout(retryTimer)
            retryTimer = null
          }
          return
        }

        // network / service down: show retry state and keep retrying
        setIsUnauthError(false)
        setHasLoadError(true)
        setIsLoading(false)
        setShowSpinner(true)

        if (retryTimer) clearTimeout(retryTimer)
        retryTimer = setTimeout(() => {
          if (mounted) load()
        }, 3000)
      }
    }

    load()

    return () => {
      mounted = false
      if (retryTimer) clearTimeout(retryTimer)
      if (spinnerTimer) clearTimeout(spinnerTimer)
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
     
        <h1 className="flex items-center gap-3 rounded-t-xl bg-linear-to-r from-[#0b5bd3] to-[#79b1ff] px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
          <img
            src="https://upload.wikimedia.org/wikipedia/de/thumb/0/00/Windows_Vista_Logo.svg/250px-Windows_Vista_Logo.svg.png"
            alt="Windows Vista"
            className="h-32 w-32 drop-shadow-2xl"
          />
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-white">Windows Vista Troubleshooting</span>
            <span className="text-xs text-white/90">Find solutions to common problems</span>
          </div>
        </h1>

      <Nav />
      
      {isAuthenticated && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-5 rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-3 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
        >
          Create troubleshooting request
        </button>
      )}

      {isUnauthError && advices.length === 0 && (
        <div className="my-10 mx-auto max-w-xl rounded-xl bg-white/60 p-6 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-md">
          <h3 className="mb-2 text-sm font-semibold text-[#0b3d91]">
            You are not logged in
          </h3>
          <p className="text-xs text-slate-600">
            Please log in to see troubleshooting requests.
          </p>
        </div>
      )}

      {(hasLoadError || (showSpinner && isLoading)) && !isUnauthError && advices.length === 0 && (
        <div className="my-10 mx-auto max-w-xl rounded-xl bg-white/60 p-6 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-md">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#79b1ff] border-t-transparent"></div>
          <h3 className="mb-1 text-sm font-semibold text-[#0b3d91]">
            Windows Troubleshooter is loading…
          </h3>
          <p className="text-xs text-slate-600">
            {hasLoadError
              ? 'Cannot reach the service. Retrying every 3 seconds…'
              : 'Detecting issues and retrieving solutions'}
          </p>
        </div>
      )}


      {!isLoading && advices.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advices.map(advice => (
            <AdvicePreviewCard key={advice._id} advice={advice} />
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
        onSubmit={async () => {
          try {
            if (editingId) {
              const updated = await handleUpdateAdvice(editingId, form)
              setAdvices(prev => prev.map(a => (a._id === editingId ? updated : a)))
              setEditingId(null)
            } else {
              const created = await handleCreateAdvice(form)
              setAdvices(prev => [created, ...prev])
            }
            setIsModalOpen(false)
            setForm({ title: '', content: '', anonymous: false })
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