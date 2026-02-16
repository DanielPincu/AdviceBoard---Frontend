import axios from 'axios'
import type { Advice } from '../interfaces/interface.advice'
import { api } from '../modules/module.interceptor'

interface SearchBarProps {
  isAuthenticated: boolean
  isSearching: boolean
  setIsSearching: (v: boolean) => void

  searchQ: string
  setSearchQ: (v: string) => void

  searchTitle: boolean
  setSearchTitle: (v: boolean) => void

  searchContent: boolean
  setSearchContent: (v: boolean) => void

  searchAnonymousOnly: boolean
  setSearchAnonymousOnly: (v: boolean) => void

  activeSearchTerms: string[]
  setActiveSearchTerms: (v: string[]) => void

  setAdvices: (v: Advice[]) => void
  loadAdvices: () => Promise<Advice[]>

  setHasLoadError: (v: boolean) => void
  setIsUnauthError: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setShowSpinner: (v: boolean) => void
}

export default function SearchBar(props: SearchBarProps) {
  const {
    isAuthenticated,
    isSearching,
    setIsSearching,
    searchQ,
    setSearchQ,
    searchTitle,
    setSearchTitle,
    searchContent,
    setSearchContent,
    searchAnonymousOnly,
    setSearchAnonymousOnly,
    activeSearchTerms,
    setActiveSearchTerms,
    setAdvices,
    loadAdvices,
    setHasLoadError,
    setIsUnauthError,
    setIsLoading,
    setShowSpinner,
  } = props

  if (!isAuthenticated) return null

  const runSearch = async () => {
    setIsSearching(true)
    // Empty search resets list
    if (!searchAnonymousOnly && !searchQ.trim()) {
      try {
        setHasLoadError(false)
        setIsUnauthError(false)
        setIsLoading(true)

        const data = await loadAdvices()
        setAdvices(data)
        setActiveSearchTerms([])
      } catch (err: unknown) {
        let status: number | undefined
        if (axios.isAxiosError(err)) status = err.response?.status

        const unauth = status === 401 || status === 403
        if (unauth) {
          setIsUnauthError(true)
          setHasLoadError(false)
        } else {
          setHasLoadError(true)
        }
      } finally {
        setIsSearching(false)
        setIsLoading(false)
        setShowSpinner(false)
      }
      return
    }

    try {
      setHasLoadError(false)
      setIsUnauthError(false)
      setIsLoading(true)

      if (searchAnonymousOnly) {
        const { data } = await api.get<Advice[]>('/advices/search', {
          params: { key: 'anonymous', value: true },
        })

        setAdvices(data)
        setActiveSearchTerms(['anonymous: true'])
        setSearchQ('')
      } else {
        const q = searchQ.trim()

        const { data } = await api.get<Advice[]>('/advices/search', {
          params: { q },
        })

        setAdvices(data)

        const labels = [
          searchTitle ? 'title' : null,
          searchContent ? 'content' : null,
        ]
          .filter(Boolean)
          .join('+')

        const term = labels ? `${labels}: ${q}` : q
        setActiveSearchTerms(q ? [term] : [])
        setSearchQ('')
      }
    } catch (err: unknown) {
      let status: number | undefined
      if (axios.isAxiosError(err)) status = err.response?.status

      const unauth = status === 401 || status === 403
      if (unauth) {
        setIsUnauthError(true)
        setHasLoadError(false)
      } else {
        setHasLoadError(true)
      }
    } finally {
      setIsSearching(false)
      setIsLoading(false)
      setShowSpinner(false)
    }
  }

  const resetSearch = async () => {
    setIsSearching(true)
    setSearchQ('')
    setActiveSearchTerms([])
    setSearchAnonymousOnly(false)
    setSearchTitle(true)
    setSearchContent(true)

    try {
      setHasLoadError(false)
      setIsUnauthError(false)
      setIsLoading(true)

      const data = await loadAdvices()
      setAdvices(data)
    } catch (err: unknown) {
      let status: number | undefined
      if (axios.isAxiosError(err)) status = err.response?.status

      const unauth = status === 401 || status === 403
      if (unauth) {
        setIsUnauthError(true)
        setHasLoadError(false)
      } else {
        setHasLoadError(true)
      }
    } finally {
      setIsSearching(false)
      setIsLoading(false)
      setShowSpinner(false)
    }
  }

  return (
    <div className="mb-4 rounded-xl bg-white/60 p-4 shadow ring-1 ring-white/50 backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (isSearching) return
              runSearch()
            }
          }}
          placeholder="Search (e.g. blue screen of death)"
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none"
        />

        <button
          onClick={runSearch}
          disabled={isSearching}
          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-2 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] disabled:opacity-60"
        >
          Search
        </button>

        <button
          onClick={resetSearch}
          className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-2 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff]"
        >
          Reset
        </button>
      </div>

      {activeSearchTerms.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeSearchTerms.map(term => (
            <span
              key={term}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 shadow ring-1 ring-blue-200"
            >
              {term}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={searchTitle}
            onChange={e => setSearchTitle(e.target.checked)}
            disabled={searchAnonymousOnly}
          />
          Title
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={searchContent}
            onChange={e => setSearchContent(e.target.checked)}
            disabled={searchAnonymousOnly}
          />
          Content
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={searchAnonymousOnly}
            onChange={e => setSearchAnonymousOnly(e.target.checked)}
          />
          Anonymous only
        </label>
      </div>
    </div>
  )
}