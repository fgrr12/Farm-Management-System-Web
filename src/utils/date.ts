import dayjs from 'dayjs'

/**
 * Formats a date value (string, Date, or null/undefined) into 'YYYY-MM-DD' format
 * suitable for HTML date inputs.
 *
 * @param dateValue The date to format
 * @returns A string in 'YYYY-MM-DD' format, or an empty string if invalid/null
 */
export const formatDateForForm = (dateValue: string | Date | null | undefined): string => {
	if (!dateValue) return ''

	try {
		// If it's already in YYYY-MM-DD format, return as is
		if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
			return dateValue
		}

		const date = dayjs(dateValue)
		if (!date.isValid()) return ''

		return date.format('YYYY-MM-DD')
	} catch {
		return ''
	}
}
