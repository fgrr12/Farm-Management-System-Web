import type { ButtonProps } from './Button.types'

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
	return (
		<button className="btn dark:btn-primary" {...props}>
			{children}
		</button>
	)
}

export const BackButton: FC<ButtonProps> = (props) => {
	return (
		<button className="btn bg-transparent border-none shadow-none" {...props}>
			<i className="i-material-symbols-arrow-left-alt-rounded w-14! h-8! bg-black!" />
		</button>
	)
}
