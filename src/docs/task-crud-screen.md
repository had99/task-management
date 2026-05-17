# Plan: Task CRUD Screen + Zod Validation

> **Mục tiêu:** Thêm màn hình `/dashboard/tasks` chuyên biệt để quản lý task dạng table (Create / Read / Update / Delete), tách biệt khỏi Kanban board hiện tại. Validate form bằng Zod thay cho inline RHF rules.

---

## 1. Tổng quan thiết kế

### 1.1 Layout tổng thể

```
/dashboard/tasks
┌─────────────────────────────────────────────────────┐
│ Header: "Tasks"          [+ New Task]                │
├──────────────────┬──────────────────────────────────┤
│ Filter bar:      │                                   │
│ [Search...]      │                                   │
│ [Project ▼]      │  Table / List                    │
│ [Status  ▼]      │                                   │
│                  │                                   │
└──────────────────┴──────────────────────────────────┘

Khi click "New Task" hoặc "Edit":
┌─────────────────────────────────────────────────────┐
│  Slide-over panel từ bên phải (không rời trang)      │
│  ┌──────────────────────────────┐                   │
│  │ New Task / Edit Task         │                   │
│  │ [form with Zod validation]   │                   │
│  │ [Cancel]  [Save]             │                   │
│  └──────────────────────────────┘                   │
└─────────────────────────────────────────────────────┘

Khi click "Delete":
  → Confirmation dialog nhỏ (inline, không redirect)
```

### 1.2 Điểm khác biệt so với TaskModal hiện tại

| | TaskModal (kanban) | TasksPage (mới) |
|---|---|---|
| Hiển thị | Modal overlay | Slide-over panel |
| Scope | 1 project | Tất cả projects |
| View | Kanban column | Table với sortable columns |
| Validation | RHF built-in rules | **Zod schema** |
| Delete | Trong modal | Confirm dialog riêng |
| Assignee | Không chọn được | Có dropdown chọn assignee |

---

## 2. Danh sách file cần tạo / chỉnh sửa

### 2.1 File MỚI

```
src/
├── lib/
│   └── validations/
│       └── taskSchema.ts          # Zod schema cho task form
├── features/
│   └── tasks/
│       ├── TasksPage.tsx          # Main page: table + filter bar
│       ├── TasksTable.tsx         # Table component với rows, sort, actions
│       ├── TaskSlideOver.tsx      # Slide-over panel chứa form
│       ├── TaskFormZod.tsx        # Form RHF + Zod (dùng cho SlideOver)
│       └── DeleteConfirmDialog.tsx # Confirm dialog xóa task
└── docs/
    └── task-crud-screen.md        # File này
```

### 2.2 File CẦN SỬA

```
src/
├── app/
│   └── router.tsx                 # Thêm route /dashboard/tasks
├── components/
│   └── layout/
│       └── Header.tsx             # Thêm navigation link "Tasks"
└── lib/
    └── msw/
        └── handlers.ts            # Thêm GET /api/tasks (all tasks, optional)
```

> **Không đụng vào:** `TaskBoard.tsx`, `TaskModal.tsx`, `TaskCard.tsx` — kanban board giữ nguyên.

---

## 3. Zod Schema

### 3.1 File: `src/lib/validations/taskSchema.ts`

```typescript
import { z } from 'zod'

export const taskSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be under 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  status: z.enum(['todo', 'in-progress', 'done'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),

  projectId: z
    .string()
    .min(1, 'Please select a project'),

  assigneeId: z
    .string()
    .optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
```

**Giải thích từng rule:**

| Field | Rule | Message |
|---|---|---|
| `title` | required, 2–100 ký tự, tự trim | "Title must be at least 2 characters" |
| `description` | optional, max 500, tự trim, hoặc empty string | "Description must be under 500 characters" |
| `status` | enum cố định | "Please select a valid status" |
| `projectId` | required (không được để trống) | "Please select a project" |
| `assigneeId` | optional | — |

### 3.2 Cách dùng với React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/taskSchema'

const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
  defaultValues: { title: '', description: '', status: 'todo', projectId: '', assigneeId: '' },
})
```

---

## 4. Chi tiết từng component

### 4.1 `TasksPage.tsx` — Main Page

**Trách nhiệm:**
- Render `FilterBar` + `TasksTable` + `TaskSlideOver` + `DeleteConfirmDialog`
- Quản lý state: `slideOverOpen`, `editingTask`, `deletingTask`
- Fetch tất cả projects (cho filter dropdown)
- Fetch tasks theo project đang chọn từ filter (hoặc tất cả nếu "All Projects")

**State cần thiết (local useState, không đưa vào Zustand):**
```typescript
const [slideOverOpen, setSlideOverOpen] = useState(false)
const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
const [deletingTask, setDeletingTask] = useState<Task | null>(null)
const [filterProjectId, setFilterProjectId] = useState<string>('all')
const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
const [searchQuery, setSearchQuery] = useState('')
```

**Layout JSX:**
```tsx
<div className="flex h-full flex-col gap-4">
  {/* Page header */}
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
    <Button onClick={() => { setEditingTaskId(null); setSlideOverOpen(true) }}>
      + New Task
    </Button>
  </div>

  {/* Filter bar */}
  <FilterBar ... />

  {/* Table */}
  <TasksTable
    tasks={filteredTasks}
    onEdit={(id) => { setEditingTaskId(id); setSlideOverOpen(true) }}
    onDelete={(task) => setDeletingTask(task)}
  />

  {/* Slide-over */}
  <TaskSlideOver
    open={slideOverOpen}
    taskId={editingTaskId}
    onClose={() => setSlideOverOpen(false)}
  />

  {/* Delete confirm */}
  <DeleteConfirmDialog
    task={deletingTask}
    onClose={() => setDeletingTask(null)}
  />
</div>
```

---

### 4.2 `TasksTable.tsx` — Table Component

**Columns:**

| Column | Hiển thị | Width |
|---|---|---|
| Title | Text, click → open edit | flex-1 |
| Project | Colored dot + name | 140px |
| Status | `<Badge>` component | 120px |
| Assignee | `<Avatar>` + name | 140px |
| Updated | Relative time ("2 hours ago") | 120px |
| Actions | Edit icon + Delete icon | 80px |

**Skeleton loading state:**
- Hiển thị 5 skeleton rows khi `isLoading`
- Mỗi row: skeleton cho từng column

**Empty state:**
```tsx
{tasks.length === 0 && (
  <div className="py-16 text-center text-sm text-gray-400">
    No tasks found. Try adjusting your filters.
  </div>
)}
```

**Row actions:**
```tsx
<button onClick={() => onEdit(task.id)} title="Edit">✏️</button>
<button onClick={() => onDelete(task)} title="Delete" className="text-red-500">🗑️</button>
```

---

### 4.3 `TaskSlideOver.tsx` — Slide-over Panel

**Cơ chế:**
- Animate từ phải vào: `translate-x-full` → `translate-x-0`
- Overlay backdrop bên trái (click backdrop → đóng)
- Fixed width: `w-full max-w-md` (cạnh phải màn hình)

**Structure:**
```tsx
<>
  {/* Backdrop */}
  {open && (
    <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
  )}

  {/* Panel */}
  <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl
    transform transition-transform duration-300
    ${open ? 'translate-x-0' : 'translate-x-full'}`}
  >
    {/* Header */}
    <div className="flex items-center justify-between border-b px-6 py-4">
      <h2>{taskId ? 'Edit Task' : 'New Task'}</h2>
      <button onClick={onClose}>✕</button>
    </div>

    {/* Form */}
    <div className="overflow-y-auto p-6">
      <TaskFormZod taskId={taskId} onSuccess={onClose} />
    </div>
  </div>
</>
```

---

### 4.4 `TaskFormZod.tsx` — Form với Zod

**Fields:**

| Field | Input type | Validation |
|---|---|---|
| Title | `<Input>` (text) | required, 2–100 chars |
| Description | `<textarea>` | optional, max 500 |
| Project | `<select>` native | required |
| Status | `<Controller>` + button group | required, enum |
| Assignee | `<select>` native (optional) | optional |

**Pre-fill khi edit:**
```typescript
useEffect(() => {
  if (task) {
    reset({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      projectId: task.projectId,
      assigneeId: task.assignee?.id ?? '',
    })
  } else {
    reset(defaultValues)
  }
}, [task, reset])
```

**Submit handler:**
```typescript
const onSubmit = async (data: TaskFormValues) => {
  if (task) {
    await updateTask({ id: task.id, projectId: task.projectId, ...data })
  } else {
    await createTask(data)
  }
  onSuccess()
}
```

**Error display:** Hiển thị ngay dưới mỗi field qua `errors.fieldName?.message`.

---

### 4.5 `DeleteConfirmDialog.tsx` — Confirm Dialog

**UI:**
```
┌─────────────────────────────────────┐
│  ⚠️  Delete Task                     │
│                                     │
│  Are you sure you want to delete    │
│  "Fix login bug"?                   │
│  This action cannot be undone.      │
│                                     │
│       [Cancel]    [Delete]          │
└─────────────────────────────────────┘
```

**Logic:**
- Chỉ hiển thị khi `task !== null`
- Click "Delete" → gọi `deleteTask({ id, projectId })` → close
- `isLoading` state trên nút Delete

---

## 5. Routing

### 5.1 Cập nhật `router.tsx`

```typescript
import { TasksPage } from '@/features/tasks/TasksPage'

// Thêm vào children của AppLayout:
{ path: '/dashboard/tasks', element: <TasksPage /> },
```

### 5.2 Cập nhật `Header.tsx`

Thêm navigation links:

```tsx
<nav className="flex items-center gap-1">
  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      `px-3 py-1.5 rounded-md text-sm font-medium transition-colors
       ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
    }
  >
    Board
  </NavLink>
  <NavLink
    to="/dashboard/tasks"
    className={({ isActive }) =>
      `px-3 py-1.5 rounded-md text-sm font-medium transition-colors
       ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
    }
  >
    Tasks
  </NavLink>
</nav>
```

---

## 6. Dependencies cần cài

```bash
npm install zod @hookform/resolvers
```

| Package | Dùng cho |
|---|---|
| `zod` | Định nghĩa schema validation |
| `@hookform/resolvers` | Bridge giữa Zod và React Hook Form (`zodResolver`) |

> **Lưu ý:** `TaskModal.tsx` hiện tại dùng RHF built-in rules — sẽ **giữ nguyên**, không refactor. Chỉ `TaskFormZod.tsx` (mới) dùng Zod.

---

## 7. Data flow

```
TasksPage
  │
  ├── useGetProjectsQuery()        → dropdown filter projects
  ├── useGetTasksQuery(projectId)  → fetch tasks theo project filter
  │
  ├── TasksTable
  │     └── tasks (filtered client-side)
  │
  ├── TaskSlideOver
  │     └── TaskFormZod
  │           ├── useGetProjectsQuery()    → dropdown chọn project trong form
  │           ├── useCreateTaskMutation()
  │           └── useUpdateTaskMutation()
  │
  └── DeleteConfirmDialog
        └── useDeleteTaskMutation()
```

---

## 8. Các edge cases cần xử lý

| Case | Xử lý |
|---|---|
| Chưa có project nào | Empty state trong filter dropdown: "No projects" |
| Task không có assignee | Avatar hiển thị "—" hoặc placeholder |
| Search không có kết quả | Empty state: "No tasks found. Try adjusting your filters." |
| Delete đang loading | Nút Delete disable + spinner |
| Submit form đang loading | Nút Save disable + spinner, form fields readonly |
| Slide-over mở trong lúc đang fetch task | Skeleton form |
| projectId thay đổi khi filter | RTK Query tự refetch (cache per projectId) |
| "All Projects" filter | Loop qua tất cả projects, fetch từng cái, merge kết quả |

---

## 9. Thứ tự implement

1. **Cài deps:** `npm install zod @hookform/resolvers`
2. **Zod schema:** `src/lib/validations/taskSchema.ts`
3. **TaskFormZod:** `src/features/tasks/TaskFormZod.tsx`
4. **DeleteConfirmDialog:** `src/features/tasks/DeleteConfirmDialog.tsx`
5. **TasksTable:** `src/features/tasks/TasksTable.tsx`
6. **TaskSlideOver:** `src/features/tasks/TaskSlideOver.tsx`
7. **TasksPage:** `src/features/tasks/TasksPage.tsx`
8. **Router + Header:** thêm route và nav links
9. **Build & verify**

---

## 10. Definition of Done

- [ ] Route `/dashboard/tasks` hoạt động
- [ ] Navigation "Board" / "Tasks" trong Header
- [ ] Table hiển thị tasks với đầy đủ columns
- [ ] Filter theo project, status, search query
- [ ] Slide-over mở/đóng animation mượt
- [ ] Form validate bằng Zod: hiển thị lỗi inline ngay khi blur/submit
- [ ] Create task mới → xuất hiện trong table ngay (RTK cache invalidate)
- [ ] Edit task → form pre-fill đúng data
- [ ] Delete → confirm dialog → task biến mất
- [ ] Optimistic update vẫn hoạt động cho update
- [ ] `npm run build` không lỗi TypeScript
