import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSpeciesForm } from '@/hooks/forms/useSpeciesForm'

describe('useSpeciesForm', () => {
	it('should initialize with default values', () => {
		const { result } = renderHook(() => useSpeciesForm())

		expect(result.current.getValues()).toEqual({
			name: '',
		})
	})

	it('should initialize with provided data', () => {
		const initialData: Partial<Species> = {
			uuid: 'test-uuid',
			name: 'Test Species',
			farmUuid: 'farm-uuid',
		}

		const { result } = renderHook(() => useSpeciesForm(initialData))

		expect(result.current.getValues()).toEqual({
			uuid: 'test-uuid',
			name: 'Test Species',
			farmUuid: 'farm-uuid',
		})
	})

	it('should transform species data to API format', () => {
		const { result } = renderHook(() => useSpeciesForm())

		const formData = {
			uuid: 'test-uuid',
			name: 'Test Species',
			farmUuid: 'farm-uuid',
		}

		const apiData = result.current.transformToApiFormat(formData)

		expect(apiData).toEqual({
			uuid: 'test-uuid',
			name: 'Test Species',
			farmUuid: 'farm-uuid',
		})
	})

	it('should reset form with new data', () => {
		const { result } = renderHook(() => useSpeciesForm())

		const newData: Partial<Species> = {
			uuid: 'new-uuid',
			name: 'New Species',
			farmUuid: 'new-farm-uuid',
		}

		result.current.resetWithData(newData)

		expect(result.current.getValues()).toEqual({
			uuid: 'new-uuid',
			name: 'New Species',
			farmUuid: 'new-farm-uuid',
		})
	})
})
