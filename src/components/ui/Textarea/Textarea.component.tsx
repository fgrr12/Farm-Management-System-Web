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
			<textarea
				id={fieldId}
				className={`textarea h-24 w-full validator ${error ? 'textarea-error' : ''}`}
				required={required}
				aria-invalid={!!error}
				{...rest}
			/>
			{error && (
				<div className="mt-1 text-sm text-red-600">
					{error}
				</div>
			)}
		</fieldset>
	)
}
