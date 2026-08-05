import dayjs from 'dayjs'

import { openPrintWindow } from '@/utils/printDocument'

import type { Farm, FarmActivityItem } from '@/types'

type Translate = (key: string, opts?: Record<string, unknown>) => string

interface BuildProductionSummaryHTMLParams {
	farm: Farm
	rangeLabel: string
	records: FarmActivityItem[]
	t: Translate
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

const buildProductionSummaryHTML = ({
	farm,
	rangeLabel,
	records,
	t,
}: BuildProductionSummaryHTMLParams): string => {
	const sorted = [...records].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
	const total = sorted.reduce((sum, record) => sum + (record.quantity || 0), 0)

	const byAnimal = new Map<string, number>()
	for (const record of sorted) {
		const label = record.animalId ? `#${record.animalId}` : t('unknownAnimal')
		byAnimal.set(label, (byAnimal.get(label) || 0) + (record.quantity || 0))
	}

	const rows =
		sorted
			.map(
				(record) => `
			<tr>
				<td>${dayjs(record.date).format('DD/MM/YYYY')}</td>
				<td>${record.animalId ? `#${escapeHtml(record.animalId)}` : t('unknownAnimal')}</td>
				<td>${record.quantity} ${farm.liquidUnit}</td>
			</tr>`
			)
			.join('') || `<tr><td colspan="3" class="empty">${t('noRecords')}</td></tr>`

	const totalsByAnimalRows = [...byAnimal.entries()]
		.map(
			([label, quantity]) => `
			<tr>
				<td>${escapeHtml(label)}</td>
				<td>${quantity} ${farm.liquidUnit}</td>
			</tr>`
		)
		.join('')

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>${escapeHtml(t('productionSummaryTitle', { range: rangeLabel }))}</title>
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
				.total-banner {
					display: flex; justify-content: space-between; align-items: center;
					background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px;
					padding: 4mm; margin-bottom: 8mm;
				}
				.total-banner .label { font-size: 9pt; text-transform: uppercase; color: #1d4ed8; letter-spacing: 0.3px; }
				.total-banner .value { font-size: 14pt; font-weight: 700; color: #1e3a8a; }
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
				<p class="subtitle">${escapeHtml(t('productionSummaryTitle', { range: rangeLabel }))}</p>

				<div class="total-banner">
					<span class="label">${t('total')}</span>
					<span class="value">${Math.round(total * 100) / 100} ${farm.liquidUnit}</span>
				</div>

				<h2>${t('byAnimal')}</h2>
				<table>
					<thead>
						<tr><th>${t('animal')}</th><th>${t('quantity')}</th></tr>
					</thead>
					<tbody>${totalsByAnimalRows || `<tr><td colspan="2" class="empty">${t('noRecords')}</td></tr>`}</tbody>
				</table>

				<h2>${t('detail')}</h2>
				<table>
					<thead>
						<tr><th>${t('date')}</th><th>${t('animal')}</th><th>${t('quantity')}</th></tr>
					</thead>
					<tbody>${rows}</tbody>
				</table>

				<p class="printed-on">${t('printedOn', { date: dayjs().format('DD/MM/YYYY HH:mm') })}</p>
			</div>
		</body>
		</html>
	`
}

export const printProductionSummary = (params: BuildProductionSummaryHTMLParams): void => {
	openPrintWindow(buildProductionSummaryHTML(params))
}
