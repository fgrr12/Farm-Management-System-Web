import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useBreedForm } from '@/hooks/forms/useBreedForm'

describe('useBreedForm', () => {
	it('should initialize with default values', () => {
		const { result } = renderHook(() => useBreedForm())

		expect(result.current.getValues()).toEqual({
			name: '',
			gestationPeriod: 0,
		})
	})

	it('should initialize with provided data', () => {
		const initialData: Partial<Breed> = {
			uuid: 'test-uuid',
			name: 'Test Breed',
			gestationPeriod: 280,
			speciesUuid: 'species-uuid',
			farmUuid: 'farm-uuid',
		}

		const { result } = renderHook(() => useBreedForm(initialData))

		expect(result.current.getValues()).toEqual({
			uuid: 'test-uuid',
			name: 'Test Breed',
			gestationPeriod: 280,
			speciesUuid: 'species-uuid',
			farmUuid: 'farm-uuid',
		})
	})

	it('should transform breed data to API format', () => {
		const { result } = renderHook(() => useBreedForm())

		const formData = {
			uuid: 'test-uuid',
			name: 'Test Breed',
			gestationPeriod: 280,
			speciesUuid: 'species-uuid',
			farmUuid: 'farm-uuid',
		}

		const apiData = result.current.transformToApiFormat(formData)

		expect(apiData).toEqual({
			uuid: 'test-uuid',
			name: 'Test Breed',
			gestationPeriod: 280,
			speciesUuid: 'species-uuid',
			farmUuid: 'farm-uuid',
		})
	})

	it('should reset form with new data', () => {
		const { result } = renderHook(() => useBreedForm())

		const newData: Partial<Breed> = {
			uuid: 'new-uuid',
			name: 'New Breed',
			gestationPeriod: 300,
			speciesUuid: 'new-species-uuid',
			farmUuid: 'new-farm-uuid',
		}

		result.current.resetWithData(newData)

		expect(result.current.getValues()).toEqual({
			uuid: 'new-uuid',
			name: 'New Breed',
			gestationPeriod: 300,
			speciesUuid: 'new-species-uuid',
			farmUuid: 'new-farm-uuid',
		})
	})
})
