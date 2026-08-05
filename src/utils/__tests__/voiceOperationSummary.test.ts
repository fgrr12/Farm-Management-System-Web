import { describe, expect, it } from 'vitest'

import type { VoiceOperation } from '@/services/voice'

import { summarizeVoiceOperation } from '../voiceOperationSummary'

// A stand-in for i18next's t(): returns the key with any {{param}} substituted, so assertions
// can check on the key/params that were used without needing real translation files loaded.
const t = (key: string, opts?: Record<string, unknown>) => {
	if (!opts) return key
	return `${key}:${Object.values(opts).join(',')}`
}

describe('summarizeVoiceOperation', () => {
	const animalLabelByUuid = new Map([['animal-1', '#12']])

	it('describes a new animal by its animalId, not its (not yet real) uuid', () => {
		const op: VoiceOperation = { operation: 'create', data: { animalId: '45', gender: 'Female' } }
		const result = summarizeVoiceOperation('animals', op, t, animalLabelByUuid)
		expect(result.primary).toBe('review.newAnimal:45')
		expect(result.secondary).toContain('Female')
	})

	it('resolves an updated animal to its tag number via the uuid map', () => {
		const op: VoiceOperation = {
			operation: 'update',
			animalUuid: 'animal-1',
			data: { weight: 300 },
		}
		const result = summarizeVoiceOperation('animals', op, t, animalLabelByUuid)
		expect(result.primary).toBe('review.updateAnimal:#12')
	})

	it('falls back to a generic label when the animal cannot be resolved', () => {
		const op: VoiceOperation = { operation: 'update', animalUuid: 'unknown-uuid', data: {} }
		const result = summarizeVoiceOperation('health', op, t, animalLabelByUuid)
		expect(result.primary).toBe('review.healthRecord:review.unknownAnimal')
	})

	it('includes type, reason and formatted date for a health record', () => {
		const op: VoiceOperation = {
			operation: 'create',
			animalUuid: 'animal-1',
			data: { type: 'Vaccination', reason: 'Annual shot', date: '2026-03-05' },
		}
		const result = summarizeVoiceOperation('health', op, t, animalLabelByUuid)
		expect(result.secondary).toBe('Vaccination · Annual shot · 05/03/2026')
	})

	it('omits date from a production record summary when the date is invalid', () => {
		const op: VoiceOperation = {
			operation: 'create',
			animalUuid: 'animal-1',
			data: { quantity: 20, unit: 'L', date: 'not-a-date' },
		}
		const result = summarizeVoiceOperation('production', op, t, animalLabelByUuid)
		expect(result.secondary).toBe('20 L')
	})

	it('describes a relation using names when uuids are not available', () => {
		const op: VoiceOperation = {
			operation: 'create',
			data: { parentName: 'Toro del vecino', childAnimalUuid: 'animal-1' },
		}
		const result = summarizeVoiceOperation('relations', op, t, animalLabelByUuid)
		expect(result.secondary).toBe('Toro del vecino → #12')
	})

	it('falls back to an "untitled" label for a task with no title', () => {
		const op: VoiceOperation = { operation: 'create', data: {} }
		const result = summarizeVoiceOperation('tasks', op, t, animalLabelByUuid)
		expect(result.primary).toBe('review.task:review.untitled')
	})
})
