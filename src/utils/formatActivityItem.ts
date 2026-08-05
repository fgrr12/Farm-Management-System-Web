import type { FarmActivityItem } from '@/types'

type Translate = (key: string, opts?: Record<string, unknown>) => string

export interface FormattedActivity {
	icon: string
	title: string
	description?: string
}

const joinDefined = (parts: Array<string | undefined | null>): string | undefined => {
	const filtered = parts.filter((part): part is string => Boolean(part))
	return filtered.length > 0 ? filtered.join(' · ') : undefined
}

/**
 * Turns one activity feed entry into an icon + short title + description — the same "what
 * happened" summary regardless of which record type it came from, so the feed reads as one
 * list instead of three differently-shaped ones.
 */
export const formatActivityItem = (
	item: FarmActivityItem,
	t: Translate,
	healthTypeT: Translate,
	liquidUnit?: string
): FormattedActivity => {
	switch (item.kind) {
		case 'health':
			return {
				icon: 'i-material-symbols-medical-services',
				title: item.animalId ? t('feed.healthFor', { animal: item.animalId }) : t('feed.health'),
				description: joinDefined([
					item.healthType
						? healthTypeT(`healthRecordType.${item.healthType.toLowerCase()}`)
						: undefined,
					item.reason,
				]),
			}

		case 'production':
			return {
				icon: 'i-material-symbols-water-drop',
				title: item.animalId
					? t('feed.productionFor', { animal: item.animalId })
					: t('feed.production'),
				description:
					item.quantity !== undefined ? `${item.quantity} ${liquidUnit || ''}`.trim() : undefined,
			}

		default:
			return {
				icon: 'i-material-symbols-task-alt',
				title: t(`feed.taskStatus.${item.taskStatus || 'todo'}`),
				description: item.title,
			}
	}
}
