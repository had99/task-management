import { useRef, useState } from 'react'
import type { Attachment } from '@/types'

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_TOTAL_FILES = 5

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('sheet')) return '📊'
  return '📎'
}

interface TaskAttachmentFieldProps {
  pendingFiles: File[]
  existingAttachments: Attachment[]
  onAddFiles: (files: File[]) => void
  onRemovePending: (index: number) => void
  onRemoveExisting: (id: string) => void
}

export function TaskAttachmentField({
  pendingFiles,
  existingAttachments,
  onAddFiles,
  onRemovePending,
  onRemoveExisting,
}: TaskAttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalFiles = existingAttachments.length + pendingFiles.length

  const validate = (files: File[]): { valid: File[]; error: string | null } => {
    const valid: File[] = []
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: [], error: `"${file.name}" is not an allowed file type.` }
      }
      if (file.size > MAX_SIZE_BYTES) {
        return { valid: [], error: `"${file.name}" exceeds the 5 MB size limit.` }
      }
      valid.push(file)
    }
    if (totalFiles + valid.length > MAX_TOTAL_FILES) {
      return { valid: [], error: `Maximum ${MAX_TOTAL_FILES} files allowed.` }
    }
    return { valid, error: null }
  }

  const handleFiles = (rawFiles: FileList | null) => {
    if (!rawFiles || rawFiles.length === 0) return
    const { valid, error } = validate(Array.from(rawFiles))
    setError(error)
    if (valid.length > 0) onAddFiles(valid)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Attachments</label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          totalFiles >= MAX_TOTAL_FILES ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
      >
        <span className="text-2xl">📎</span>
        <p className="text-sm font-medium text-gray-600">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-400">
          PNG, JPG, GIF, PDF, DOCX, XLSX, TXT — max 5 MB each, up to {MAX_TOTAL_FILES} files
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        // Reset value so same file can be re-selected after removal
        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Existing attachments (edit mode) */}
      {existingAttachments.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uploaded</p>
          {existingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">{fileIcon(att.mimeType)}</span>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm text-blue-600 hover:underline"
                >
                  {att.name}
                </a>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {formatBytes(att.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExisting(att.id)}
                className="ml-2 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Pending upload
          </p>
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0">{fileIcon(file.type)}</span>
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {formatBytes(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemovePending(index)}
                className="ml-2 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
