import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

import type { FarmActivityItem } from '@/types'
import { groupActivitiesByDay } from '../groupActivitiesByDay'

const item = (date: string, id = date): FarmActivityItem => ({ id, kind: 'health', date })

describe('groupActivitiesByDay', () => {
	const now = dayjs('2026-03-05T12:00:00')

	it('groups items from the same day together', () => {
		const groups = groupActivitiesByDay(
			[item('2026-03-05T08:00:00', 'a'), item('2026-03-05T18:00:00', 'b')],
			now
		)
		expect(groups).toHaveLength(1)
		expect(groups[0]?.items.map((i) => i.id)).toEqual(['a', 'b'])
	})

	it('labels today and yesterday, and orders newest day first', () => {
		const groups = groupActivitiesByDay(
			[item('2026-03-03T10:00:00'), item('2026-03-05T10:00:00'), item('2026-03-04T10:00:00')],
			now
		)
		expect(groups.map((g) => g.dayKind)).toEqual(['today', 'yesterday', 'other'])
		expect(groups.map((g) => g.dateKey)).toEqual(['2026-03-05', '2026-03-04', '2026-03-03'])
	})

	it('returns nothing for an empty feed', () => {
		expect(groupActivitiesByDay([], now)).toEqual([])
	})
})
