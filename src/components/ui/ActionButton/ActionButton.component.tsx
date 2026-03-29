import type { FC } from 'react'
import { memo } from 'react'

import type { ActionButtonProps } from './ActionButton.types'

const iconColor = (icon: string | undefined) => {
	switch (icon) {
		case 'i-material-symbols-add-circle-outline':
			return 'bg-blue-500!'
		case 'i-material-symbols-delete-outline':
			return 'bg-red-500!'
		case 'i-material-symbols-light-health-metrics-rounded':
			return 'bg-emerald-500!'
		case 'i-icon-park-outline-milk':
			return 'bg-blue-500!'
		case 'i-tabler-circles-relation':
			return 'bg-yellow-500!'
		case 'i-lucide-circle-x':
		case 'i-material-symbols-event-busy-rounded':
			return 'bg-red-500!'
		case 'i-lineicons-xmark':
		case 'i-lineicons-microphone-1':
			return 'bg-white!'
		default:
			return ''
	}
}

export const ActionButton: FC<ActionButtonProps> = memo(({ icon, title, ...rest }) => {
	return (
		<button
			type="button"
			className="btn btn-circle btn-ghost hover:bg-base-200 animate-scale-bounce-in transition-transform duration-200 hover:scale-110 active:scale-95"
			aria-label={title}
			{...rest}
		>
			<i
				className={`${icon} h-6! w-6! ${rest.disabled ? 'text-base-content/30!' : iconColor(icon)}`}
			/>
		</button>
	)
})
