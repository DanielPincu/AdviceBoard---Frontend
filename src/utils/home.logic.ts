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

export async function loadAdvices(): Promise<Advice[]> {
  return fetchAllAdvices()
}

export async function handleDeleteAdvice(id: string): Promise<string | null> {
  const ok = window.confirm('Are you sure you want to delete this post? This cannot be undone.')
  if (!ok) return null

  try {
    await deleteAdviceById(id)
    return id
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      alert('You can only delete your own posts.')
      return null
    }
    alert('Failed to delete post.')
    console.error(err)
    return null
  }
}

export async function handleCreateAdvice(form: { title: string; content: string; anonymous: boolean }): Promise<Advice> {
  const title = form.title.trim()
  const content = form.content.trim()

  if (title.length < 3) throw new Error('Title must be at least 3 characters')
  if (content.length < 3) throw new Error('Content must be at least 3 characters')

  return createAdvice({ ...form, title, content })
}

export async function handleUpdateAdvice(
  id: string,
  form: { title: string; content: string; anonymous: boolean }
): Promise<Advice> {
  const title = form.title.trim()
  const content = form.content.trim()

  if (title.length < 3) throw new Error('Title must be at least 3 characters')
  if (content.length < 3) throw new Error('Content must be at least 3 characters')

  return updateAdviceById(id, { title, content, anonymous: form.anonymous })
}

export async function handleAddReplyToAdvice(
  adviceId: string,
  content: string,
  anonymous: boolean
): Promise<Advice> {
  if (!content || content.trim().length < 3) {
    throw new Error('Reply must be at least 3 characters')
  }

  return addReply(adviceId, { content: content.trim(), anonymous })
}

export async function handleDeleteReplyFromAdvice(
  adviceId: string,
  replyId: string
): Promise<void> {
  const ok = window.confirm('Are you sure you want to delete this reply?')
  if (!ok) throw new Error('Cancelled')

  await deleteReply(adviceId, replyId)
}

export async function handleUpdateReplyOnAdvice(
  adviceId: string,
  replyId: string,
  content: string,
  anonymous: boolean
): Promise<Advice> {
  if (!content || content.trim().length < 3) {
    throw new Error('Reply must be at least 3 characters')
  }

  return updateReplyById(adviceId, replyId, {
    content: content.trim(),
    anonymous,
  })
}