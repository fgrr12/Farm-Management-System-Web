import dayjs, { type Dayjs } from 'dayjs'

import type { FarmActivityItem } from '@/types'

export interface ActivityDayGroup {
	dateKey: string
	dayKind: 'today' | 'yesterday' | 'other'
	items: FarmActivityItem[]
}

/**
 * Groups a flat activity list into day buckets ("hoja del día"), newest day first. Items within
 * a day keep whatever order they arrived in (the backend already sorts the full feed by date).
 * `now` is only a parameter so tests don't depend on the real clock.
 */
export const groupActivitiesByDay = (
	items: FarmActivityItem[],
	now: Dayjs = dayjs()
): ActivityDayGroup[] => {
	const todayKey = now.format('YYYY-MM-DD')
	const yesterdayKey = now.subtract(1, 'day').format('YYYY-MM-DD')

	const groups = new Map<string, FarmActivityItem[]>()
	for (const item of items) {
		const key = dayjs(item.date).format('YYYY-MM-DD')
		const bucket = groups.get(key)
		if (bucket) {
			bucket.push(item)
		} else {
			groups.set(key, [item])
		}
	}

	return Array.from(groups.entries())
		.sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
		.map(([dateKey, groupItems]) => ({
			dateKey,
			dayKind: dateKey === todayKey ? 'today' : dateKey === yesterdayKey ? 'yesterday' : 'other',
			items: groupItems,
		}))
}
