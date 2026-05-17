import { z } from 'zod/v4'

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
    error: () => 'Please select a valid status',
  }),

  projectId: z.string().min(1, 'Please select a project'),

  assigneeId: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
