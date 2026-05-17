import { Button } from '@/components/ui/Button'

interface TaskFormActionsProps {
  isEdit: boolean
  isLoading: boolean
  onCancel: () => void
}

export function TaskFormActions({ isEdit, isLoading, onCancel }: TaskFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" isLoading={isLoading}>
        {isEdit ? 'Update Task' : 'Create Task'}
      </Button>
    </div>
  )
}
