# Plan: Tách TaskFormPage + Thêm Attachment Upload

> **Mục tiêu:** Tách `TaskFormPage.tsx` hiện tại thành các component nhỏ, bổ sung field attachment cho phép upload file.

---

## 1. Cấu trúc file sau khi tách

```
src/features/tasks/
├── TaskFormPage.tsx              # Chỉ còn: layout + orchestrate state + submit logic
├── components/
│   ├── TaskBasicInfoFields.tsx   # Title, Description, Project, Status, Assignee
│   ├── TaskAttachmentField.tsx   # Upload file, danh sách file đã chọn, xóa file
│   └── TaskFormActions.tsx       # Cancel button + Submit button
```

---

## 2. Phân tách từng component

### 2.1 `TaskBasicInfoFields.tsx`

**Nhận vào (props):**
```typescript
interface TaskBasicInfoFieldsProps {
  register: UseFormRegister<TaskFormValues>
  control: Control<TaskFormValues>
  errors: FieldErrors<TaskFormValues>
  projects: Project[]
}
```

**Nội dung:** Tất cả fields hiện có trong form:
- Title (`<Input>`)
- Description (`<textarea>`)
- Project (`<select>`)
- Status (button group qua `<Controller>`)
- Assignee (`<select>`)

Không có thêm logic, chỉ render UI + nhận RHF props từ parent.

---

### 2.2 `TaskAttachmentField.tsx`

**Nhận vào (props):**
```typescript
interface TaskAttachmentFieldProps {
  files: File[]                        // pending files (chưa upload)
  existingAttachments: Attachment[]    // files đã upload (chỉ có khi edit)
  onAddFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
  onRemoveExisting: (id: string) => void
  isUploading?: boolean
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│  Attachments                            │
│  ┌─────────────────────────────────┐   │
│  │  📎 Click to upload or drag     │   │
│  │     PNG, JPG, PDF, DOCX — 5MB   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Already uploaded (edit mode):          │
│  📄 design-spec.pdf  (240 KB)  [✕]    │
│  🖼  screenshot.png  (84 KB)   [✕]    │
│                                         │
│  Pending (chưa upload):                 │
│  📄 new-file.docx    (120 KB)  [✕]    │
└─────────────────────────────────────────┘
```

**Validation (local, không qua Zod):**
- Max file size: **5 MB** mỗi file
- Allowed types: `image/*`, `.pdf`, `.docx`, `.xlsx`, `.txt`
- Max số file: **5 files** tổng (existing + pending)
- Hiển thị lỗi inline ngay dưới drop zone khi vi phạm

**Không upload ngay khi chọn file** — chỉ lưu vào local state, upload sau khi submit form.

---

### 2.3 `TaskFormActions.tsx`

**Nhận vào (props):**
```typescript
interface TaskFormActionsProps {
  isEdit: boolean
  isLoading: boolean
  onCancel: () => void
}
```

**UI:**
```
[ Cancel ]    [ Update Task / Create Task ⟳ ]
```

Không có logic — chỉ render 2 button, `onCancel` và `type="submit"`.

---

## 3. Kiểu dữ liệu mới

### 3.1 Thêm vào `src/types/index.ts`

```typescript
export interface Attachment {
  id: string
  name: string
  size: number      // bytes
  mimeType: string
  url: string       // object URL hoặc mock URL
  uploadedAt: string
}
```

### 3.2 Cập nhật `Task` interface

```typescript
export interface Task {
  // ... existing fields
  attachments?: Attachment[]
}
```

---

## 4. MSW mock endpoints

Thêm 2 endpoints vào `src/lib/msw/handlers.ts`:

| Method | URL | Mô tả |
|--------|-----|--------|
| `POST` | `/api/tasks/:id/attachments` | Upload file (nhận `FormData`, trả về `Attachment`) |
| `DELETE` | `/api/tasks/:id/attachments/:attachmentId` | Xóa attachment |

**Mock handler `POST /api/tasks/:id/attachments`:**
```typescript
http.post('/api/tasks/:id/attachments', async ({ params, request }) => {
  await delay(400)
  const formData = await request.formData()
  const file = formData.get('file') as File
  const attachment: Attachment = {
    id: `att-${Date.now()}`,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    url: URL.createObjectURL(file),  // local blob URL
    uploadedAt: new Date().toISOString(),
  }
  const task = mockTasks.find(t => t.id === params.id)
  if (task) {
    task.attachments = [...(task.attachments ?? []), attachment]
  }
  return HttpResponse.json(attachment, { status: 201 })
})
```

---

## 5. RTK Query endpoints mới

Thêm vào `src/features/tasks/tasksApi.ts`:

```typescript
uploadAttachment: builder.mutation<Attachment, { taskId: string; file: File }>({
  query: ({ taskId, file }) => {
    const body = new FormData()
    body.append('file', file)
    return { url: `/tasks/${taskId}/attachments`, method: 'post', data: body }
  },
  invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
}),

deleteAttachment: builder.mutation<void, { taskId: string; attachmentId: string; projectId: string }>({
  query: ({ taskId, attachmentId }) => ({
    url: `/tasks/${taskId}/attachments/${attachmentId}`,
    method: 'delete',
  }),
  invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
}),
```

---

## 6. Logic submit trong `TaskFormPage.tsx` (sau khi tách)

```
Submit form
  │
  ├── [New task]
  │     1. createTask(data)           → nhận task.id
  │     2. Với mỗi file trong pendingFiles:
  │           uploadAttachment({ taskId: task.id, file })
  │     3. navigate('/dashboard/tasks')
  │
  └── [Edit task]
        1. updateTask({ id, ...data })
        2. Với mỗi file trong pendingFiles:
              uploadAttachment({ taskId: id, file })
        3. removedExistingIds.forEach(id =>
              deleteAttachment({ taskId, attachmentId: id }))
        4. navigate('/dashboard/tasks')
```

**State cần trong `TaskFormPage`:**
```typescript
const [pendingFiles, setPendingFiles] = useState<File[]>([])
const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])
```

---

## 7. Danh sách file cần tạo / sửa

### Tạo mới
```
src/features/tasks/components/
├── TaskBasicInfoFields.tsx
├── TaskAttachmentField.tsx
└── TaskFormActions.tsx
```

### Sửa
```
src/types/index.ts               # Thêm Attachment, cập nhật Task
src/lib/msw/handlers.ts          # Thêm 2 attachment endpoints
src/features/tasks/tasksApi.ts   # Thêm uploadAttachment, deleteAttachment
src/features/tasks/TaskFormPage.tsx  # Dùng 3 sub-components, thêm attachment logic
```

---

## 8. Thứ tự implement

1. **Types:** Thêm `Attachment` vào `types/index.ts`
2. **MSW handlers:** Thêm 2 attachment endpoints
3. **tasksApi:** Thêm `uploadAttachment`, `deleteAttachment` mutations
4. **TaskBasicInfoFields:** Tách fields hiện có ra
5. **TaskAttachmentField:** Component upload mới
6. **TaskFormActions:** Tách buttons ra
7. **TaskFormPage:** Refactor dùng 3 sub-components + attachment submit logic

---

## 9. Definition of Done

- [ ] `TaskFormPage.tsx` chỉ còn layout + state + submit, không chứa field UI trực tiếp
- [ ] `TaskBasicInfoFields` nhận RHF props và render đúng 5 fields hiện có
- [ ] `TaskAttachmentField` cho phép chọn file qua click hoặc drag-and-drop
- [ ] Validation file: từ chối file > 5MB hoặc sai type, hiển thị lỗi ngay
- [ ] Tối đa 5 files tổng cộng
- [ ] New task: upload file sau khi task được tạo thành công
- [ ] Edit task: hiển thị file đã upload, có thể xóa và thêm mới
- [ ] `TaskFormActions` render 2 button với đúng label và loading state
- [ ] `npm run build` không lỗi TypeScript
