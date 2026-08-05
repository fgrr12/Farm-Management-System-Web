import dayjs from 'dayjs'

import { openPrintWindow } from '@/utils/printDocument'

import type { Animal, Farm, HealthRecord, ProductionRecord } from '@/types'

type Translate = (key: string, opts?: Record<string, unknown>) => string

interface BuildAnimalHistoryHTMLParams {
	farm: Farm
	animal: Animal
	speciesName?: string
	breedName?: string
	healthRecords: HealthRecord[]
	productionRecords: ProductionRecord[]
	t: Translate
	/** Translates a health record type (e.g. "Vaccination") into the user's language —
	 *  bound to the healthRecordForm namespace, same as HealthRecordsTable uses on screen. */
	healthTypeT: Translate
}

const escapeHtml = (value: string): string =>
	value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case '&':
				return '&amp;'
			case '<':
				return '&lt;'
			case '>':
				return '&gt;'
			case '"':
				return '&quot;'
			default:
				return '&#39;'
		}
	})

const formatDate = (date?: string | null): string => (date ? dayjs(date).format('DD/MM/YYYY') : '—')

const buildAnimalHistoryHTML = ({
	farm,
	animal,
	speciesName,
	breedName,
	healthRecords,
	productionRecords,
	t,
	healthTypeT,
}: BuildAnimalHistoryHTMLParams): string => {
	const healthRows =
		healthRecords
			.map(
				(record) => `
			<tr>
				<td>${formatDate(record.date)}</td>
				<td>${escapeHtml(healthTypeT(`healthRecordType.${record.type.toLowerCase()}`))}</td>
				<td>${escapeHtml(record.reason || '—')}</td>
				<td>${escapeHtml(record.medication || '—')}</td>
				<td>${record.withdrawalEndDate ? formatDate(record.withdrawalEndDate) : '—'}</td>
			</tr>`
			)
			.join('') || `<tr><td colspan="5" class="empty">${t('noRecords')}</td></tr>`

	const productionRows =
		productionRecords
			.map(
				(record) => `
			<tr>
				<td>${formatDate(record.date)}</td>
				<td>${record.quantity} ${farm.liquidUnit}</td>
			</tr>`
			)
			.join('') || `<tr><td colspan="2" class="empty">${t('noRecords')}</td></tr>`

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>${escapeHtml(t('animalHistoryTitle', { id: animal.animalId }))}</title>
			<style>
				@page { size: A4 portrait; margin: 15mm; }
				* { margin: 0; padding: 0; box-sizing: border-box; }
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					color: #1e293b;
					font-size: 10pt;
				}
				.toolbar {
					position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
					background: #1e293b; padding: 10px 20px;
					display: flex; align-items: center; gap: 12px;
				}
				.toolbar-btn {
					background: #3b82f6; color: white; border: none; border-radius: 6px;
					padding: 8px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
				}
				.toolbar-btn:hover { background: #2563eb; }
				.sheet { margin-top: 64px; }
				h1 { font-size: 16pt; margin-bottom: 2mm; }
				.subtitle { color: #64748b; margin-bottom: 8mm; }
				.info-grid {
					display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm;
					margin-bottom: 8mm; padding: 4mm; background: #f8fafc; border-radius: 4px;
				}
				.info-label { font-size: 8pt; text-transform: uppercase; color: #64748b; letter-spacing: 0.3px; }
				.info-value { font-size: 10pt; font-weight: 600; }
				h2 { font-size: 12pt; margin: 6mm 0 3mm; border-bottom: 2px solid #e2e8f0; padding-bottom: 1mm; }
				table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; }
				th, td { text-align: left; padding: 2mm 3mm; border-bottom: 1px solid #e2e8f0; font-size: 9pt; }
				th { background: #f1f5f9; font-size: 8pt; text-transform: uppercase; color: #475569; }
				td.empty { text-align: center; color: #94a3b8; font-style: italic; }
				.printed-on { color: #94a3b8; font-size: 8pt; margin-top: 8mm; }
				@media print {
					.toolbar { display: none !important; }
					.sheet { margin-top: 0 !important; }
				}
			</style>
		</head>
		<body>
			<div class="toolbar">
				<button class="toolbar-btn" onclick="window.print()">🖨️ ${t('print')}</button>
			</div>
			<div class="sheet">
				<h1>${escapeHtml(farm.name)}</h1>
				<p class="subtitle">${escapeHtml(t('animalHistoryTitle', { id: animal.animalId }))}</p>

				<div class="info-grid">
					<div><div class="info-label">${t('species')}</div><div class="info-value">${escapeHtml(speciesName || '—')}</div></div>
					<div><div class="info-label">${t('breed')}</div><div class="info-value">${escapeHtml(breedName || '—')}</div></div>
					<div><div class="info-label">${t('gender')}</div><div class="info-value">${escapeHtml(animal.gender)}</div></div>
					<div><div class="info-label">${t('weight')}</div><div class="info-value">${animal.weight} ${farm.weightUnit}</div></div>
					<div><div class="info-label">${t('birthDate')}</div><div class="info-value">${formatDate(animal.birthDate)}</div></div>
					<div><div class="info-label">${t('color')}</div><div class="info-value">${escapeHtml(animal.color || '—')}</div></div>
				</div>

				<h2>${t('healthHistory')}</h2>
				<table>
					<thead>
						<tr>
							<th>${t('date')}</th>
							<th>${t('type')}</th>
							<th>${t('reason')}</th>
							<th>${t('medication')}</th>
							<th>${t('withdrawalUntil')}</th>
						</tr>
					</thead>
					<tbody>${healthRows}</tbody>
				</table>

				<h2>${t('productionHistory')}</h2>
				<table>
					<thead>
						<tr>
							<th>${t('date')}</th>
							<th>${t('quantity')}</th>
						</tr>
					</thead>
					<tbody>${productionRows}</tbody>
				</table>

				<p class="printed-on">${t('printedOn', { date: dayjs().format('DD/MM/YYYY HH:mm') })}</p>
			</div>
		</body>
		</html>
	`
}

export const printAnimalHistory = (params: BuildAnimalHistoryHTMLParams): void => {
	openPrintWindow(buildAnimalHistoryHTML(params))
}
