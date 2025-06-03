import type { ActionButtonProps } from './ActionButton.types'

export const ActionButton: FC<ActionButtonProps> = ({ icon, ...rest }) => {
	const iconColor = () => {
		switch (icon) {
			case 'i-material-symbols-add-circle-outline':
				return 'bg-blue-500!'
			case 'i-material-symbols-delete-outline':
				return 'bg-red-500!'
			case 'i-material-symbols-light-health-metrics-rounded':
				return 'bg-emerald-500!'
			case 'i-icon-park-outline-milk':
				return 'bg-gray-500!'
			case 'i-tabler-circles-relation':
				return 'bg-yellow-500!'
			default:
				return ''
		}
	}

	return (
		<button
			type="button"
			className="btn btn-circle bg-transparent border-none shadow-none"
			{...rest}
		>
			<i className={`${icon} h-7! w-7! ${rest.disabled ? 'bg-gray-400!' : iconColor()}`} />
		</button>
	)
}
