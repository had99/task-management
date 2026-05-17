export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Project {
  id: string
  name: string
  color: string
  taskCount: number
  createdAt: string
}

export interface Attachment {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
  uploadedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignee: User | null
  projectId: string
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  status: TaskStatus
  assigneeId?: string
  projectId: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  id: string
  projectId: string
}
