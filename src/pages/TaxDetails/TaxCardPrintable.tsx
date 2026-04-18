import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxDetails } from '@/types/taxDetails'

type CardVariant = 'dark' | 'light'

interface TaxCardPrintableProps {
	taxDetails: TaxDetails
}

const getImageBase64 = async (src: string): Promise<string> => {
	try {
		const response = await fetch(src)
		if (!response.ok) return ''
		const blob = await response.blob()
		return new Promise((resolve) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.onerror = () => resolve('')
			reader.readAsDataURL(blob)
		})
	} catch {
		return ''
	}
}

const buildCardHTML = (
	variant: CardVariant,
	taxDetails: TaxDetails,
	imageBase64: string,
	t: (key: string) => string
): string => {
	const isDark = variant === 'dark'

	const cardBg = isDark
		? 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)'
		: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)'
	const cardColor = isDark ? 'white' : '#1e293b'
	const titleColor = isDark ? '#e2e8f0' : '#334155'
	const highlightColor = isDark ? '#60a5fa' : '#2563eb'
	const labelColor = isDark ? '#cbd5e1' : '#64748b'
	const valueColor = isDark ? 'white' : '#0f172a'
	const logoBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
	const logoBorder = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
	const activityBg = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'
	const activityBorder = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
	const activityCodeBg = isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)'
	const activityCodeColor = isDark ? 'white' : '#2563eb'
	const noActivitiesColor = isDark ? '#cbd5e1' : '#94a3b8'
	const shadowColor = isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)'
	const blurColor1 = isDark ? '#3b82f6' : '#93c5fd'
	const blurColor2 = isDark ? '#8b5cf6' : '#a78bfa'
	const cardBorder = isDark ? 'none' : '1px solid #e2e8f0'

	const activitiesHTML =
		taxDetails.activities
			?.map(
				(activity) => `
		<div class="activity-item">
			<div class="activity-name">${activity.name}</div>
			<div class="activity-code">${activity.code}</div>
		</div>
	`
			)
			.join('') ?? ''

	const logoHTML = imageBase64
		? `<img src="${imageBase64}" alt="Farm" style="width: 7mm; height: 7mm; object-fit: cover; border-radius: 50%;" />`
		: '🐓'

	const frontCard = `
		<div class="card">
			<div class="card-header">
				<h3 class="card-title">
					${t('taxCardTitle')}<br>
					<span class="card-title-highlight">${t('electronicInvoicing')}</span>
				</h3>
				<div class="farm-logo">${logoHTML}</div>
			</div>
			<div class="card-content">
				<div class="card-main-info">
					<div class="info-row">
						<span class="info-label">${t('name')}</span>
						<span class="info-value">${taxDetails.name || 'N/A'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">${t('id')}</span>
						<span class="info-value">${taxDetails.id || 'N/A'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">${t('phone')}</span>
						<span class="info-value">${taxDetails.phone || 'N/A'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">${t('email')}</span>
						<span class="info-value">${taxDetails.email || 'N/A'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">${t('address')}</span>
						<span class="info-value">${taxDetails.address || 'N/A'}</span>
					</div>
				</div>
			</div>
		</div>`

	const backCard = `
		<div class="card card-back">
			<div class="activities-header">${t('activities')}</div>
			<div class="activities-list">
				${activitiesHTML || `<div style="text-align:center;color:${noActivitiesColor};font-size:8pt;">${t('noActivities')}</div>`}
			</div>
		</div>`

	const spacer = `<div class="card-spacer"></div>`

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>${t('title')} - ${taxDetails.name}</title>
			<style>
				@page { size: A4 portrait; margin: 10mm; }
				* { margin: 0; padding: 0; box-sizing: border-box; }
				body {
					font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					background: #f8fafc;
				}
				.toolbar {
					position: fixed;
					top: 0; left: 0; right: 0;
					z-index: 9999;
					background: #1e293b;
					padding: 10px 20px;
					display: flex;
					align-items: center;
					gap: 12px;
					box-shadow: 0 2px 8px rgba(0,0,0,0.3);
				}
				.toolbar-btn {
					background: #3b82f6;
					color: white;
					border: none;
					border-radius: 6px;
					padding: 8px 18px;
					font-size: 14px;
					font-weight: 600;
					cursor: pointer;
					font-family: inherit;
				}
				.toolbar-btn:hover { background: #2563eb; }
				.toolbar-name { color: #e2e8f0; font-size: 14px; font-weight: 600; }
				.toolbar-hint {
					margin-left: auto;
					color: #64748b;
					font-size: 11px;
					font-style: italic;
				}
				/* Each .page fills exactly one A4 sheet (297mm - 2x10mm margins = 277mm) */
				.page {
					display: grid;
					grid-template-columns: repeat(2, 85.60mm);
					grid-template-rows: repeat(3, 42mm);
					gap: 3mm;
					justify-content: center;
					align-content: center;
					height: 277mm;
				}
				.page-fronts { margin-top: 52px; }
				.card-spacer { width: 85.60mm; height: 42mm; }
				.card {
					width: 85.60mm;
					height: 42mm;
					background: ${cardBg};
					border-radius: 12px;
					padding: 5mm;
					position: relative;
					overflow: hidden;
					color: ${cardColor};
					display: flex;
					flex-direction: column;
					box-shadow: 0 8px 25px ${shadowColor};
					border: ${cardBorder};
				}
				.card::before {
					content: '';
					position: absolute;
					top: 0; right: 0;
					width: 24mm; height: 24mm;
					background: ${blurColor1};
					border-radius: 50%;
					filter: blur(20px);
					transform: translate(12mm, -12mm);
					opacity: 0.3;
				}
				.card::after {
					content: '';
					position: absolute;
					bottom: 0; left: 0;
					width: 20mm; height: 20mm;
					background: ${blurColor2};
					border-radius: 50%;
					filter: blur(20px);
					transform: translate(-10mm, 10mm);
					opacity: 0.3;
				}
				.card-header {
					position: relative;
					z-index: 10;
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
				}
				.card-title {
					flex: 1;
					font-size: 10pt;
					font-weight: 700;
					color: ${titleColor};
					text-transform: uppercase;
					letter-spacing: 0.5px;
					line-height: 1.1;
					max-width: 70%;
				}
				.card-title-highlight { color: ${highlightColor}; }
				.farm-logo {
					width: 10mm; height: 10mm;
					background: ${logoBg};
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					border: 1px solid ${logoBorder};
					margin-left: 4mm;
					overflow: hidden;
				}
				.card-content {
					position: relative;
					z-index: 10;
					flex: 1;
					display: flex;
				}
				.card-main-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 1mm;
				}
				.info-row {
					display: grid;
					grid-template-columns: auto 1fr;
					gap: 2mm;
					align-items: center;
				}
				.info-label {
					font-size: 8pt;
					font-weight: 600;
					color: ${labelColor};
					text-transform: uppercase;
					letter-spacing: 0.3px;
					min-width: 12mm;
				}
				.info-value {
					font-size: 9pt;
					font-weight: 600;
					color: ${valueColor};
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.card-back { background: ${cardBg}; }
				.activities-header {
					position: relative;
					z-index: 10;
					text-align: center;
					font-size: 11pt;
					font-weight: 700;
					color: ${highlightColor};
					text-transform: uppercase;
					letter-spacing: 0.5px;
					margin-bottom: 3mm;
				}
				.activities-list {
					position: relative;
					z-index: 10;
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 1.5mm;
					overflow: hidden;
				}
				.activity-item {
					padding: 1.5mm 2mm;
					background: ${activityBg};
					border: 1px solid ${activityBorder};
					border-radius: 4px;
					display: grid;
					grid-template-columns: 1fr auto;
					gap: 2mm;
					align-items: center;
				}
				.activity-name {
					font-size: 8pt;
					font-weight: 600;
					color: ${valueColor};
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.activity-code {
					font-size: 8pt;
					font-weight: 700;
					color: ${activityCodeColor};
					background: ${activityCodeBg};
					padding: 0.5mm 1.5mm;
					border-radius: 3px;
				}
				@media print {
					.toolbar { display: none !important; }
					.page-fronts { margin-top: 0 !important; }
					body {
						background: white !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					/* Page 1 (fronts) forces a page break after; page 2 (backs) does NOT */
					.page-fronts {
						page-break-after: always !important;
						break-after: always !important;
					}
					.page-backs {
						page-break-after: avoid !important;
						break-after: avoid !important;
					}
					.card {
						background: ${cardBg} !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
						color: ${cardColor} !important;
						page-break-inside: avoid !important;
						break-inside: avoid !important;
					}
					.card::before, .card::after {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
				}
			</style>
		</head>
		<body>
			<div class="toolbar">
				<button class="toolbar-btn" onclick="window.print()">🖨️ ${t('downloadCards')}</button>
				<span class="toolbar-name">${taxDetails.name}</span>
				<span class="toolbar-hint">${t('printDuplexHint')}</span>
			</div>
			<!-- Page 1: Fronts only -->
			<div class="page page-fronts">
				${Array(8).fill(frontCard).join('')}
				${spacer}
			</div>
			<!-- Page 2: Backs only — flip sheet on long edge before printing this side -->
			<div class="page page-backs">
				${Array(8).fill(backCard).join('')}
				${spacer}
			</div>
		</body>
		</html>
	`
}

const openPrintWindow = (html: string) => {
	const printWindow = window.open('', '_blank')
	if (!printWindow) return

	printWindow.document.write(html)
	printWindow.document.close()
	printWindow.focus()
}

export const useTaxCardPrintable = ({ taxDetails }: TaxCardPrintableProps) => {
	const { t } = useTranslation('taxDetails')

	const handleDownloadCards = useCallback(
		async (variant: CardVariant) => {
			const imageBase64 = await getImageBase64('/assets/billing/hen.jpeg')
			const html = buildCardHTML(variant, taxDetails, imageBase64, t)
			openPrintWindow(html)
		},
		[taxDetails, t]
	)

	return { handleDownloadCards }
}
