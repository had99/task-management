import { http, HttpResponse, delay } from 'msw'
import type { Project, Task, User, Attachment, CreateTaskDto, UpdateTaskDto } from '@/types'

// --- SEED DATA ---

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Nguyen', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/40?u=u1' },
  { id: 'u2', name: 'Bob Tran',     email: 'bob@example.com',   avatar: 'https://i.pravatar.cc/40?u=u2' },
  { id: 'u3', name: 'Carol Le',     email: 'carol@example.com', avatar: 'https://i.pravatar.cc/40?u=u3' },
]

const mockProjects: Project[] = [
  { id: 'p1', name: 'Frontend', color: '#3B82F6', taskCount: 6, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'p2', name: 'Backend',  color: '#10B981', taskCount: 7, createdAt: '2024-01-02T00:00:00Z' },
  { id: 'p3', name: 'Design',   color: '#8B5CF6', taskCount: 5, createdAt: '2024-01-03T00:00:00Z' },
]

// Mutable array — handlers mutate trực tiếp để simulate CRUD
let mockTasks: Task[] = [
  // Project p1 — Frontend
  { id: 't1',  title: 'Setup Vite + React',     status: 'done',        projectId: 'p1', assignee: mockUsers[0], description: 'Init project with Vite and React 19',  createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z' },
  { id: 't2',  title: 'Configure TailwindCSS',  status: 'done',        projectId: 'p1', assignee: mockUsers[1], description: undefined,                               createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-01-11T00:00:00Z' },
  { id: 't3',  title: 'Build LoginPage UI',     status: 'in-progress', projectId: 'p1', assignee: mockUsers[0], description: 'Use useActionState from React 19',       createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z' },
  { id: 't4',  title: 'Implement TaskBoard',    status: 'in-progress', projectId: 'p1', assignee: mockUsers[2], description: 'Kanban board with 3 columns',             createdAt: '2024-01-13T00:00:00Z', updatedAt: '2024-01-13T00:00:00Z' },
  { id: 't5',  title: 'Write unit tests',       status: 'todo',        projectId: 'p1', assignee: null,         description: undefined,                                createdAt: '2024-01-14T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z' },
  { id: 't6',  title: 'Deploy to Vercel',       status: 'todo',        projectId: 'p1', assignee: mockUsers[1], description: undefined,                                createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },

  // Project p2 — Backend
  { id: 't7',  title: 'Design DB schema',       status: 'done',        projectId: 'p2', assignee: mockUsers[1], description: 'PostgreSQL schema for tasks and users',  createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z' },
  { id: 't8',  title: 'Auth API endpoints',     status: 'done',        projectId: 'p2', assignee: mockUsers[2], description: undefined,                                createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-01-11T00:00:00Z' },
  { id: 't9',  title: 'Tasks CRUD API',         status: 'done',        projectId: 'p2', assignee: mockUsers[0], description: undefined,                                createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z' },
  { id: 't10', title: 'Write API docs',         status: 'in-progress', projectId: 'p2', assignee: mockUsers[1], description: 'OpenAPI 3.0 documentation',              createdAt: '2024-01-13T00:00:00Z', updatedAt: '2024-01-13T00:00:00Z' },
  { id: 't11', title: 'Add pagination',         status: 'in-progress', projectId: 'p2', assignee: null,         description: undefined,                                createdAt: '2024-01-14T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z' },
  { id: 't12', title: 'Rate limiting',          status: 'todo',        projectId: 'p2', assignee: mockUsers[2], description: undefined,                                createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: 't13', title: 'Performance profiling',  status: 'todo',        projectId: 'p2', assignee: null,         description: undefined,                                createdAt: '2024-01-16T00:00:00Z', updatedAt: '2024-01-16T00:00:00Z' },

  // Project p3 — Design
  { id: 't14', title: 'Wireframes',             status: 'done',        projectId: 'p3', assignee: mockUsers[2], description: 'Lo-fi wireframes for all screens',       createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z' },
  { id: 't15', title: 'Design System tokens',   status: 'done',        projectId: 'p3', assignee: mockUsers[0], description: 'Colors, typography, spacing',             createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-01-11T00:00:00Z' },
  { id: 't16', title: 'High-fidelity mockups',  status: 'in-progress', projectId: 'p3', assignee: mockUsers[2], description: undefined,                                createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z' },
  { id: 't17', title: 'User testing',           status: 'todo',        projectId: 'p3', assignee: null,         description: undefined,                                createdAt: '2024-01-13T00:00:00Z', updatedAt: '2024-01-13T00:00:00Z' },
  { id: 't18', title: 'Handoff to devs',        status: 'todo',        projectId: 'p3', assignee: mockUsers[1], description: undefined,                                createdAt: '2024-01-14T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z' },
]

let taskIdCounter = 19
let attachmentIdCounter = 1

const findUser = (id?: string): User | null =>
  id ? (mockUsers.find(u => u.id === id) ?? null) : null

export const handlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async () => {
    await delay(300)
    return HttpResponse.json({
      token: 'mock-token-' + Date.now(),
      user: mockUsers[0],
    })
  }),

  // GET /api/projects
  http.get('/api/projects', async () => {
    await delay(200)
    return HttpResponse.json(mockProjects)
  }),

  // GET /api/projects/:id/tasks
  http.get('/api/projects/:id/tasks', async ({ params }) => {
    await delay(200)
    const tasks = mockTasks.filter(t => t.projectId === params.id)
    return HttpResponse.json(tasks)
  }),

  // POST /api/tasks
  http.post('/api/tasks', async ({ request }) => {
    await delay(300)
    const body = await request.json() as CreateTaskDto
    const newTask: Task = {
      id: `t${taskIdCounter++}`,
      title: body.title,
      description: body.description,
      status: body.status,
      assignee: findUser(body.assigneeId),
      projectId: body.projectId,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockTasks.push(newTask)
    const project = mockProjects.find(p => p.id === body.projectId)
    if (project) project.taskCount++
    return HttpResponse.json(newTask, { status: 201 })
  }),

  // PATCH /api/tasks/:id
  http.patch('/api/tasks/:id', async ({ params, request }) => {
    await delay(300)
    const body = await request.json() as Partial<UpdateTaskDto>
    const index = mockTasks.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
    }
    mockTasks[index] = {
      ...mockTasks[index],
      ...body,
      assignee: body.assigneeId !== undefined
        ? findUser(body.assigneeId)
        : mockTasks[index].assignee,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(mockTasks[index])
  }),

  // DELETE /api/tasks/:id
  http.delete('/api/tasks/:id', async ({ params }) => {
    await delay(200)
    const index = mockTasks.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
    }
    const [removed] = mockTasks.splice(index, 1)
    const project = mockProjects.find(p => p.id === removed.projectId)
    if (project) project.taskCount = Math.max(0, project.taskCount - 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/tasks/:id/attachments
  http.post('/api/tasks/:id/attachments', async ({ params, request }) => {
    await delay(400)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const attachment: Attachment = {
      id: `att-${attachmentIdCounter++}`,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }
    const task = mockTasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
    }
    task.attachments = [...(task.attachments ?? []), attachment]
    return HttpResponse.json(attachment, { status: 201 })
  }),

  // DELETE /api/tasks/:id/attachments/:attachmentId
  http.delete('/api/tasks/:id/attachments/:attachmentId', async ({ params }) => {
    await delay(200)
    const task = mockTasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 })
    }
    task.attachments = (task.attachments ?? []).filter(a => a.id !== params.attachmentId)
    return new HttpResponse(null, { status: 204 })
  }),
]
