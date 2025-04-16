import type { SearchProps } from './Search.types'

export const Search: FC<SearchProps> = ({ placeholder, ...rest }) => {
	return (
		<label className="input p-2! w-full h-full rounded-md border-none focus:outline-none">
			<i className="i-ph-magnifying-glass-duotone h-6! w-6! opacity-50" />
			<input
				type="search"
				className="grow"
				placeholder={placeholder}
				autoComplete="off"
				{...rest}
			/>
		</label>
	)
}
