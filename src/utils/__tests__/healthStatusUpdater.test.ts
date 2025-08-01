import { beforeEach, describe, expect, it, vi } from 'vitest'

import { calculateHealthStatusFromRecords } from '../healthStatusUpdater'

// Mock the AnimalsService
vi.mock('@/services/animals', () => ({
	AnimalsService: {
		updateAnimalFields: vi.fn(),
		getAnimal: vi.fn(),
	},
}))

describe('healthStatusUpdater', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('calculateHealthStatusFromRecords', () => {
		it('should return unknown for animals with no records', () => {
			const result = calculateHealthStatusFromRecords([])
			expect(result).toBe('unknown')
		})

		it('should return unknown for sold animals', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Routine checkup',
					notes: 'Animal looks healthy',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const animal = { soldDate: '2024-01-01' }
			const result = calculateHealthStatusFromRecords(records, undefined, animal)
			expect(result).toBe('unknown')
		})

		it('should return unknown for dead animals', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Routine checkup',
					notes: 'Animal looks healthy',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const animal = { deathDate: '2024-01-01' }
			const result = calculateHealthStatusFromRecords(records, undefined, animal)
			expect(result).toBe('unknown')
		})

		it('should return healthy for recent checkup with no issues', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Routine checkup',
					notes: 'Animal looks healthy and strong',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('healthy')
		})

		it('should return sick for checkup with health issue keywords', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Animal seems sick',
					notes: 'Found some problems during examination',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('sick')
		})

		it('should return treatment for checkup with medication prescribed', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Routine checkup',
					notes: 'Minor issue found',
					medication: 'Antibiotics',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('treatment')
		})

		it('should return sick for abnormal temperature', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Temperature check',
					notes: 'Regular checkup',
					temperature: 40.5, // High fever
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('sick')
		})

		it('should return critical for very abnormal temperature', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Emergency check',
					notes: 'Very high fever',
					temperature: 42.0, // Critical temperature
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('critical')
		})

		it('should return critical for recent surgery', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Surgery',
					reason: 'Emergency surgery',
					notes: 'Surgery completed successfully',
					date: new Date().toISOString(), // Today
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('critical')
		})

		it('should return treatment for recent medication', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Medication',
					reason: 'Antibiotic treatment',
					notes: 'Started medication course',
					medication: 'Penicillin',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('treatment')
		})

		it('should return healthy for recent vaccination', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Vaccination',
					reason: 'Annual vaccination',
					notes: 'Vaccination completed',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('healthy')
		})

		it('should handle Spanish keywords correctly', () => {
			const records: HealthRecord[] = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Revisión rutinaria',
					notes: 'El animal tiene fiebre y parece enfermo',
					date: new Date().toISOString(),
					status: true,
					reviewedBy: 'vet',
					createdBy: 'user',
				},
			]

			const result = calculateHealthStatusFromRecords(records)
			expect(result).toBe('sick')
		})
	})
})
