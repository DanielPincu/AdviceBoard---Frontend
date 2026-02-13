export interface Reply {
  _id: string
  content: string
  createdAt: string
  anonymous: boolean
  _createdBy?: string
  _isMine?: boolean
}