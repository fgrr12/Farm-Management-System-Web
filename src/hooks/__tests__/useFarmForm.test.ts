import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFarmForm } from '@/hooks/forms/useFarmForm'

describe('useFarmForm', () => {
	it('should initialize with default values', () => {
		const { result } = renderHook(() => useFarmForm())

		expect(result.current.getValues()).toEqual({
			name: '',
			address: '',
			liquidUnit: 'L',
			weightUnit: 'Kg',
			temperatureUnit: '°C',
			status: true,
		})
	})

	it('should initialize with provided data', () => {
		const initialData: Partial<Farm> = {
			uuid: 'test-uuid',
			name: 'Test Farm',
			address: 'Test Address',
			liquidUnit: 'Gal',
			weightUnit: 'P',
			temperatureUnit: '°F',
			taxDetailsUuid: 'billing-uuid',
			status: false,
		}

		const { result } = renderHook(() => useFarmForm(initialData))

		expect(result.current.getValues()).toEqual({
			uuid: 'test-uuid',
			name: 'Test Farm',
			address: 'Test Address',
			liquidUnit: 'Gal',
			weightUnit: 'P',
			temperatureUnit: '°F',
			taxDetailsUuid: 'billing-uuid',
			status: false,
		})
	})

	it('should transform farm data to API format', () => {
		const { result } = renderHook(() => useFarmForm())

		const formData = {
			uuid: 'test-uuid',
			name: 'Test Farm',
			address: 'Test Address',
			liquidUnit: 'L' as const,
			weightUnit: 'Kg' as const,
			temperatureUnit: '°C' as const,
			taxDetailsUuid: '',
			status: true,
		}

		const apiData = result.current.transformToApiFormat(formData)

		expect(apiData).toEqual({
			uuid: 'test-uuid',
			name: 'Test Farm',
			address: 'Test Address',
			liquidUnit: 'L',
			weightUnit: 'Kg',
			temperatureUnit: '°C',
			taxDetailsUuid: '',
			status: true,
		})
	})

	it('should reset form with new data', () => {
		const { result } = renderHook(() => useFarmForm())

		const newData: Partial<Farm> = {
			uuid: 'new-uuid',
			name: 'New Farm',
			address: 'New Address',
			liquidUnit: 'Gal',
			weightUnit: 'P',
			temperatureUnit: '°F',
			taxDetailsUuid: 'new-billing-uuid',
			status: false,
		}

		result.current.resetWithData(newData)

		expect(result.current.getValues()).toEqual({
			uuid: 'new-uuid',
			name: 'New Farm',
			address: 'New Address',
			liquidUnit: 'Gal',
			weightUnit: 'P',
			temperatureUnit: '°F',
			taxDetailsUuid: 'new-billing-uuid',
			status: false,
		})
	})
})
