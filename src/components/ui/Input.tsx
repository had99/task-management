import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

// WHY: forwardRef bắt buộc để react-hook-form có thể gắn ref vào input
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            'w-full rounded-md border px-3 py-2 text-sm outline-none',
            'border-gray-300 bg-white placeholder:text-gray-400',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
