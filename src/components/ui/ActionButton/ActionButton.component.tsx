import type { ActionButtonProps } from './ActionButton.types'

/**
 * @name ActionButton
 * @description Inserts an icon as a button on the webpage
 * @param {string} icon - Name of unoCSS icon
 **/
export const ActionButton: FC<ActionButtonProps> = ({ icon, ...rest }) => {
	const iconColor = () => {
		switch (icon) {
			case 'i-material-symbols-add-circle-outline':
				return 'bg-blue-500!'
			case 'i-material-symbols-delete-outline':
				return 'bg-red-500!'
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
