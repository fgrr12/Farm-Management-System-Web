import type { FC, ReactElement } from 'react'

import type { TextareaProps } from './Textarea.types'

export const Textarea: FC<TextareaProps> = ({ label, ...rest }): ReactElement => {
	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">{label}</legend>
			<textarea className="textarea h-24 w-full" placeholder="Bio" {...rest} />
		</fieldset>
	)
}
