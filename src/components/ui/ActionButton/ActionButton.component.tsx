import type { ActionButtonProps } from './ActionButton.types'

/**
 * @name ActionButton
 * @description Inserts an icon as a button on the webpage
 * @param {string} icon - Name of unoCSS icon
 **/
export const ActionButton: FC<ActionButtonProps> = ({ icon, ...rest }) => {
	return (
		<button
			type="button"
			className="btn btn-circle bg-transparent border-none shadow-none"
			{...rest}
		>
			{icon !== 'i-material-symbols-delete-outline' ? (
				<i className={`${icon} h-7! w-7! ${rest.disabled ? 'bg-gray-400!' : ''}`} />
			) : (
				<i className={`${icon} h-7! w-7! ${rest.disabled ? 'bg-gray-400!' : 'bg-red-500!'}`} />
			)}
		</button>
	)
}
