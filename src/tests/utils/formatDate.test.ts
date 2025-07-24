import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

import { formatDate } from '@/utils/formatDate'

// Mock dayjs
vi.mock('dayjs', () => {
	const mockDayjs = vi.fn((date) => ({
		toISOString: () => {
			if (date === '2024-01-15') return '2024-01-15T00:00:00.000Z'
			if (date === '2024-12-31T23:59:59') return '2024-12-31T23:59:59.000Z'
			return '2024-01-01T00:00:00.000Z'
		},
	}))
	return { default: mockDayjs }
})

describe('formatDate', () => {
	it('should format string date to ISO string', () => {
		const result = formatDate('2024-01-15')

		expect(dayjs).toHaveBeenCalledWith('2024-01-15')
		expect(result).toBe('2024-01-15T00:00:00.000Z')
	})

	it('should format datetime string to ISO string', () => {
		const result = formatDate('2024-12-31T23:59:59')

		expect(dayjs).toHaveBeenCalledWith('2024-12-31T23:59:59')
		expect(result).toBe('2024-12-31T23:59:59.000Z')
	})

	it('should handle dayjs object input', () => {
		const mockDayjsObject = {
			toISOString: () => '2024-06-15T12:30:00.000Z',
		} as any

		// Mock dayjs to return the object as-is when passed a dayjs object
		vi.mocked(dayjs).mockImplementationOnce(() => mockDayjsObject)

		const result = formatDate(mockDayjsObject)

		expect(result).toBe('2024-06-15T12:30:00.000Z')
	})

	it('should handle empty string', () => {
		const result = formatDate('')

		expect(dayjs).toHaveBeenCalledWith('')
		expect(result).toBe('2024-01-01T00:00:00.000Z')
	})

	it('should handle invalid date string', () => {
		const result = formatDate('invalid-date')

		expect(dayjs).toHaveBeenCalledWith('invalid-date')
		expect(result).toBe('2024-01-01T00:00:00.000Z')
	})

	it('should handle null or undefined input gracefully', () => {
		const result1 = formatDate(null as any)
		const result2 = formatDate(undefined as any)

		expect(dayjs).toHaveBeenCalledWith(null)
		expect(dayjs).toHaveBeenCalledWith(undefined)
		expect(result1).toBe('2024-01-01T00:00:00.000Z')
		expect(result2).toBe('2024-01-01T00:00:00.000Z')
	})
})
