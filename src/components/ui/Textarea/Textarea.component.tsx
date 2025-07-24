import type { FC, ReactElement } from 'react'
import { useId } from 'react'

import type { TextareaProps } from './Textarea.types'

export const Textarea: FC<TextareaProps> = ({ label, error, required, ...rest }): ReactElement => {
	const fieldId = useId()

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="relative w-full group">
				<textarea
					id={fieldId}
					className={`textarea min-h-24 w-full validator field-sizing-content ${error ? 'border-red-500 pr-10' : ''}`}
					required={required}
					aria-invalid={!!error}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					{...rest}
				/>

				{error && (
					<div className="absolute top-3 right-3">
						<i className="i-lucide-alert-circle text-red-500 w-4 h-4 cursor-help" title={error} />
					</div>
				)}

				{error && (
					<div
						id={`${fieldId}-error`}
						className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
						role="tooltip"
						aria-live="polite"
					>
						<div className="text-sm text-red-700 font-medium">{error}</div>
						<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 border-l border-t border-red-200 transform rotate-45" />
					</div>
				)}
			</div>
		</fieldset>
	)
}
