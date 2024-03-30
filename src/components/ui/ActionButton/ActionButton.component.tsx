import * as S from './ActionButton.styles'
import type { ActionButtonProps } from './ActionButton.types'

/**
 * @name ActionButton
 * @description Inserts an icon as a button on the webpage
 * @param {string} icon - Name of unoCSS icon
 **/
export const ActionButton: FC<ActionButtonProps> = ({ icon, ...rest }) => {
	return (
		<S.ActionButton {...rest}>
			<S.Icon className={icon} />
		</S.ActionButton>
	)
}
