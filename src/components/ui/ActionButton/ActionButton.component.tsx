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
				<i className={`${icon} h-6! w-6! bg-white!`} />
			) : (
				<i className={`${icon} h-6! w-6! bg-red-500!`} />
			)}
		</button>
	)
}
