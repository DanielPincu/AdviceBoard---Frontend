import type { Advice } from '../interfaces/interface.advice'
import axios from 'axios'
import {
  fetchAllAdvices,
  deleteAdviceById,
  createAdvice,
  addReply,
  deleteReply,
  updateAdviceById,
  updateReplyById,
} from '../modules/module.advice'

export type ApiErrorBody = { message?: string }
export type PopulatedUser = { _id: string; username: string }
export type EditingReply = { adviceId: string; replyId: string } | null
type JwtPayload = { id?: string }

// -------- helpers (user / auth) --------

export function isPopulatedUser(v: unknown): v is PopulatedUser {
  return (
    typeof v === 'object' &&
    v !== null &&
    '_id' in v &&
    typeof (v as Record<string, unknown>)._id === 'string' &&
    'username' in v
  )
}

export function getUsername(v: unknown, anonymous?: boolean): string {
  if (anonymous) return 'Anonymous'
  if (isPopulatedUser(v)) return v.username
  if (typeof v === 'string' && v) return `User ${v}`
  return 'User'
}

export function getMyUserId(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload
    return payload?.id ?? null
  } catch {
    return null
  }
}

export function getOwnerId(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v !== null && '_id' in v) {
    return String((v as { _id: unknown })._id)
  }
  return null
}

export function isOwner(createdBy: unknown): boolean {
  const me = getMyUserId()
  const ownerId = getOwnerId(createdBy)
  return Boolean(me && ownerId && me === ownerId)
}

// -------- API actions --------

export async function loadAdvices(setAdvices: (v: Advice[]) => void) {
  const data = await fetchAllAdvices()
  setAdvices(data)
}

export async function handleDeleteAdvice(
  id: string,
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void
) {
  const ok = window.confirm('Are you sure you want to delete this post? This cannot be undone.')
  if (!ok) return

  try {
    await deleteAdviceById(id)
    setAdvices(prev => prev.filter(a => a._id !== id))
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      alert('You can only delete your own posts.')
      return
    }
    alert('Failed to delete post.')
    console.error(err)
  }
}

export async function handleCreateAdvice(
  form: { title: string; content: string; anonymous: boolean },
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void,
  onSuccess: () => void,
  setError: (v: string | null) => void
) {
  setError(null)

  const title = form.title.trim()
  const content = form.content.trim()

  if (title.length < 3) return setError('Title must be at least 3 characters')
  if (content.length < 3) return setError('Content must be at least 3 characters')

  try {
    const created = await createAdvice({ ...form, title, content })
    setAdvices(prev => [created, ...prev])
    onSuccess()
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data as ApiErrorBody | undefined)?.message
      : undefined
    setError(msg || 'Failed to create advice. Check your input.')
  }
}

export async function handleUpdateAdvice(
  id: string,
  form: { title: string; content: string; anonymous: boolean },
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void,
  onSuccess: () => void,
  setError: (v: string | null) => void
) {
  setError(null)

  const title = form.title.trim()
  const content = form.content.trim()

  if (title.length < 3) return setError('Title must be at least 3 characters')
  if (content.length < 3) return setError('Content must be at least 3 characters')

  try {
    const updated = await updateAdviceById(id, { title, content, anonymous: form.anonymous })
    setAdvices(prev => prev.map(a => (a._id === id ? updated : a)))
    onSuccess()
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data as ApiErrorBody | undefined)?.message
      : undefined
    setError(msg || 'Failed to update advice. Check your input.')
  }
}

export async function handleAddReplyToAdvice(
  adviceId: string,
  content: string,
  anonymous: boolean,
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void,
  setError: (v: string | null) => void
) {
  if (!content || content.trim().length < 3) {
    return setError('Reply must be at least 3 characters')
  }

  try {
    const updated = await addReply(adviceId, { content: content.trim(), anonymous })
    setAdvices(prev => prev.map(a => (a._id === adviceId ? updated : a)))
    setError(null)
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data as ApiErrorBody | undefined)?.message
      : undefined
    setError(msg || 'Failed to add reply')
  }
}

export async function handleDeleteReplyFromAdvice(
  adviceId: string,
  replyId: string,
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void
) {
  const ok = window.confirm('Are you sure you want to delete this reply?')
  if (!ok) return

  try {
    await deleteReply(adviceId, replyId)
    setAdvices(prev =>
      prev.map(a =>
        a._id === adviceId
          ? { ...a, replies: a.replies.filter(r => r._id !== replyId) }
          : a
      )
    )
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      alert('You can only delete your own replies.')
      return
    }
    alert('Failed to delete reply.')
    console.error(err)
  }
}

export async function handleUpdateReplyOnAdvice(
  adviceId: string,
  replyId: string,
  content: string,
  anonymous: boolean,
  setAdvices: (fn: (prev: Advice[]) => Advice[]) => void,
  setError: (v: string | null) => void
) {
  if (!content || content.trim().length < 3) {
    return setError('Reply must be at least 3 characters')
  }

  try {
    const updated = await updateReplyById(adviceId, replyId, {
      content: content.trim(),
      anonymous,
    })
    setAdvices(prev => prev.map(a => (a._id === adviceId ? updated : a)))
    setError(null)
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data as ApiErrorBody | undefined)?.message
      : undefined
    setError(msg || 'Failed to update reply')
  }
}