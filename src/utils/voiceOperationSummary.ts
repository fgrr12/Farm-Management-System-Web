import dayjs from 'dayjs'

import type { VoiceEntityType, VoiceOperation } from '@/services/voice'

export interface VoiceOperationSummary {
	primary: string
	secondary?: string
}

type Translate = (key: string, opts?: Record<string, unknown>) => string

const formatDate = (value?: string | null): string | undefined => {
	if (!value) return undefined
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.format('DD/MM/YYYY') : undefined
}

const joinDefined = (parts: Array<string | undefined | null | false>): string | undefined => {
	const filtered = parts.filter((part): part is string => Boolean(part))
	return filtered.length > 0 ? filtered.join(' · ') : undefined
}

/**
 * Turns one parsed voice operation into a plain-language summary for the review step —
 * the whole point being the person can see what's about to be written before it happens.
 * Only the fields most useful for a quick sanity check are shown, not every field the AI
 * extracted; the full record can still be edited afterward from its normal form if needed.
 */
export const summarizeVoiceOperation = (
	type: VoiceEntityType,
	op: VoiceOperation,
	t: Translate,
	animalLabelByUuid: Map<string, string>
): VoiceOperationSummary => {
	const animalLabel = (uuid?: string | null, fallbackId?: string | null): string =>
		(uuid && animalLabelByUuid.get(uuid)) || fallbackId || t('review.unknownAnimal')

	switch (type) {
		case 'animals': {
			const isNew = op.operation === 'create'
			const label = isNew
				? t('review.newAnimal', { id: op.data.animalId || '?' })
				: t('review.updateAnimal', { id: animalLabel(op.animalUuid, op.data.animalId) })
			return {
				primary: label,
				secondary: joinDefined([
					op.data.gender,
					op.data.color,
					op.data.weight ? `${op.data.weight}` : undefined,
					op.data.healthStatus,
				]),
			}
		}

		case 'health': {
			return {
				primary: t('review.healthRecord', { animal: animalLabel(op.animalUuid) }),
				secondary: joinDefined([
					op.data.type,
					op.data.reason,
					op.data.medication,
					formatDate(op.data.date),
				]),
			}
		}

		case 'production': {
			return {
				primary: t('review.productionRecord', { animal: animalLabel(op.animalUuid) }),
				secondary: joinDefined([
					op.data.quantity !== undefined
						? `${op.data.quantity} ${op.data.unit || ''}`.trim()
						: undefined,
					op.data.productionType,
					formatDate(op.data.date),
				]),
			}
		}

		case 'tasks': {
			return {
				primary: t('review.task', { title: op.data.title || t('review.untitled') }),
				secondary: joinDefined([op.data.priority, formatDate(op.data.dueDate)]),
			}
		}

		case 'relations': {
			const parent =
				op.data.parentName || op.data.parentAnimalId || animalLabel(op.data.parentAnimalUuid)
			const child =
				op.data.childName || op.data.childAnimalId || animalLabel(op.data.childAnimalUuid)
			return {
				primary: t('review.relation'),
				secondary: `${parent} → ${child}`,
			}
		}

		case 'calendar': {
			return {
				primary: t('review.calendarEvent', { title: op.data.title || t('review.untitled') }),
				secondary: joinDefined([formatDate(op.data.date || op.data.startDate), op.data.time]),
			}
		}

		default:
			return { primary: type }
	}
}
