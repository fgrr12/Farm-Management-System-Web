import type { SearchProps } from './Search.types'

export const Search: FC<SearchProps> = ({ placeholder, ...rest }) => {
	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend text-black dark:text-white">{placeholder}</legend>
			<label className="input p-2 w-full h-12 rounded-md border-none focus:outline-none">
				<i className="i-ph-magnifying-glass-duotone h-6! w-6! opacity-50" />
				<input
					type="search"
					className="grow"
					placeholder={placeholder}
					autoComplete="off"
					{...rest}
				/>
			</label>
		</fieldset>
	)
}
