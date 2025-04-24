export const capitalizeFirstLetter = (str: string) => {
	if (str.length === 0) return str
	return str.replace(/^./, str[0].toUpperCase())
}
