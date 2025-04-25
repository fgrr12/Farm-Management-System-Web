export const capitalizeFirstLetter = (str: string | number) => {
	if (typeof str !== 'string' || str.length === 0) return str
	return str.replace(/^./, str[0].toUpperCase())
}
