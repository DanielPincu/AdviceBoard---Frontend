import type { Reply } from './interface.reply.js'
export interface Advice {
  _id: string
  title: string
  content: string
  anonymous: boolean
  _createdBy: string
  createdAt: string
  _isMine?: boolean
  replies: Reply[]
}