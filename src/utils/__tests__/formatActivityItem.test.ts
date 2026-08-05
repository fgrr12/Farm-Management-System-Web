import { describe, expect, it } from 'vitest'

import type { FarmActivityItem } from '@/types'
import { formatActivityItem } from '../formatActivityItem'

const t = (key: string, opts?: Record<string, unknown>) =>
	opts ? `${key}:${Object.values(opts).join(',')}` : key
const healthTypeT = (key: string) => `type:${key}`

describe('formatActivityItem', () => {
	it('names the animal in the title when it can be resolved', () => {
		const item: FarmActivityItem = {
			id: '1',
			kind: 'health',
			date: '2026-03-05',
			animalId: '12',
			healthType: 'Vaccination',
			reason: 'Annual shot',
		}
		const result = formatActivityItem(item, t, healthTypeT)
		expect(result.title).toBe('feed.healthFor:12')
		expect(result.description).toBe('type:healthRecordType.vaccination · Annual shot')
	})

	it('falls back to a generic title when there is no animal', () => {
		const item: FarmActivityItem = { id: '1', kind: 'health', date: '2026-03-05' }
		const result = formatActivityItem(item, t, healthTypeT)
		expect(result.title).toBe('feed.health')
	})

	it('appends the farm liquid unit to a production quantity', () => {
		const item: FarmActivityItem = {
			id: '1',
			kind: 'production',
			date: '2026-03-05',
			animalId: '5',
			quantity: 20,
		}
		const result = formatActivityItem(item, t, healthTypeT, 'L')
		expect(result.description).toBe('20 L')
	})

	it('uses the task status as the title and the task title as the description', () => {
		const item: FarmActivityItem = {
			id: '1',
			kind: 'task',
			date: '2026-03-05',
			taskStatus: 'done',
			title: 'Feed the cows',
		}
		const result = formatActivityItem(item, t, healthTypeT)
		expect(result.title).toBe('feed.taskStatus.done')
		expect(result.description).toBe('Feed the cows')
	})
})
