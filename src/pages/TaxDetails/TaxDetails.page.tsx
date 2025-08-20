import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'

import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const TaxDetails = () => {
	const { taxDetails } = useFarmStore()
	const { t } = useTranslation('taxDetails')
	const { setPageTitle } = usePagePerformance()

	const handleDownloadCards = useCallback(() => {
		const printWindow = window.open('', '_blank')
		if (!printWindow) return

		const cardHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>${t('title')} - ${taxDetails?.name}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body { 
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
						background: #f8fafc;
						padding: 16px;
					}
					.page {
						width: 210mm;
						min-height: 297mm;
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						grid-template-rows: repeat(4, 1fr);
						gap: 8mm;
						margin: 0 auto;
						background: white;
						padding: 12mm;
						border-radius: 8px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					}
					.card {
						width: 85.60mm;
						height: 53.98mm;
						border-radius: 8px;
						padding: 4mm;
						background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
						position: relative;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						overflow: hidden;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						color: white;
					}
					.card::before {
						content: '';
						position: absolute;
						top: 0;
						right: 0;
						width: 20mm;
						height: 20mm;
						background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
						border-radius: 50%;
						transform: translate(50%, -50%);
					}
					.card-header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 2mm;
					}
					.card-title {
						font-size: 7px;
						font-weight: 700;
						color: #e2e8f0;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						line-height: 1.2;
					}
					.farm-logo {
						width: 8mm;
						height: 8mm;
						background: rgba(255, 255, 255, 0.15);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						backdrop-filter: blur(10px);
						border: 1px solid rgba(255, 255, 255, 0.1);
					}
					.card-content {
						flex: 1;
						display: flex;
						flex-direction: column;
						gap: 1.2mm;
					}
					.info-row {
						display: grid;
						grid-template-columns: 20mm 1fr;
						gap: 1.5mm;
						font-size: 6.5px;
						line-height: 1.3;
					}
					.info-label {
						font-weight: 600;
						color: #cbd5e1;
						text-transform: uppercase;
						letter-spacing: 0.3px;
					}
					.info-value {
						font-weight: 500;
						color: #f8fafc;
						word-break: break-word;
					}
					.card-footer {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding-top: 1.5mm;
						border-top: 1px solid rgba(255, 255, 255, 0.1);
					}
					.activity-code {
						font-size: 8px;
						font-weight: 700;
						color: #3b82f6;
						background: rgba(59, 130, 246, 0.15);
						padding: 1mm 2mm;
						border-radius: 3px;
						border: 1px solid rgba(59, 130, 246, 0.3);
					}
					.card-type {
						font-size: 5px;
						color: #94a3b8;
						text-transform: uppercase;
						letter-spacing: 0.5px;
					}
					@media print {
						body { 
							background: white;
							padding: 0; 
						}
						.page { 
							margin: 0;
							box-shadow: none;
							border-radius: 0;
						}
					}
				</style>
			</head>
			<body>
				<div class="page">
					${Array(8)
						.fill(0)
						.map(
							() => `
						<div class="card">
							<div class="card-header">
								<div class="card-title">
									${t('taxCardTitle')}<br>
									<span style="color: #3b82f6;">${t('electronic')}</span>
								</div>
								<div class="farm-logo">
									🐄
								</div>
							</div>
							<div class="card-content">
								<div class="info-row">
									<span class="info-label">${t('name')}</span>
									<span class="info-value">${taxDetails?.name || 'N/A'}</span>
								</div>
								<div class="info-row">
									<span class="info-label">${t('id')}</span>
									<span class="info-value">${taxDetails?.id || 'N/A'}</span>
								</div>
								<div class="info-row">
									<span class="info-label">${t('phone')}</span>
									<span class="info-value">${taxDetails?.phone || 'N/A'}</span>
								</div>
								<div class="info-row">
									<span class="info-label">${t('email')}</span>
									<span class="info-value">${taxDetails?.email || 'N/A'}</span>
								</div>
								<div class="info-row">
									<span class="info-label">${t('address')}</span>
									<span class="info-value">${taxDetails?.address || 'N/A'}</span>
								</div>
							</div>
							<div class="card-footer">
								<div class="activity-code">${taxDetails?.activityCode || 'N/A'}</div>
								<div class="card-type">${t('digitalInvoicing')}</div>
							</div>
						</div>
					`
						)
						.join('')}
				</div>
			</body>
			</html>
		`

		printWindow.document.write(cardHTML)
		printWindow.document.close()
		printWindow.focus()
		setTimeout(() => {
			printWindow.print()
		}, 500)
	}, [taxDetails, t])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	if (!taxDetails) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
				<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
					<div className="flex flex-col items-center justify-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<i className="i-material-symbols-receipt-long w-8! h-8! text-gray-400" />
						</div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{t('noTaxDetails')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
							{t('noTaxDetailsMessage')}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<i className="i-material-symbols-receipt-long bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{t('title')}
								</h1>
								<p className="text-slate-200 text-sm sm:text-base mt-1">{t('subtitle')}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Tax Details Card Preview */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-preview w-5! h-5! text-gray-600 dark:text-gray-300" />
							{t('cardDetails')}
						</h2>
						<Button
							onClick={handleDownloadCards}
							className="btn-primary flex items-center gap-2 text-sm"
						>
							<i className="i-material-symbols-download w-4! h-4!" />
							{t('downloadCards')}
						</Button>
					</div>

					{/* Credit Card Style Preview */}
					<div className="flex justify-center">
						<div className="relative w-[340px] h-[215px] rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 text-white shadow-2xl overflow-hidden">
							{/* Card Background Pattern */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-blue-400/20 to-transparent rounded-full transform translate-x-16 -translate-y-16" />

							{/* Card Header */}
							<div className="flex justify-between items-start mb-4">
								<div>
									<div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
										{t('taxCardTitle')}
									</div>
									<div className="text-xs text-blue-400 font-semibold">{t('electronic')}</div>
								</div>
								<div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
									<span className="text-lg">🐄</span>
								</div>
							</div>

							{/* Card Content */}
							<div className="space-y-2 mb-4">
								<div className="grid grid-cols-[80px_1fr] gap-3 text-xs">
									<span className="text-slate-300 font-medium uppercase">{t('name')}</span>
									<span className="text-white font-medium truncate">{taxDetails.name}</span>
								</div>
								<div className="grid grid-cols-[80px_1fr] gap-3 text-xs">
									<span className="text-slate-300 font-medium uppercase">{t('id')}</span>
									<span className="text-white font-medium">{taxDetails.id}</span>
								</div>
								<div className="grid grid-cols-[80px_1fr] gap-3 text-xs">
									<span className="text-slate-300 font-medium uppercase">{t('phone')}</span>
									<span className="text-white font-medium">{taxDetails.phone}</span>
								</div>
								<div className="grid grid-cols-[80px_1fr] gap-3 text-xs">
									<span className="text-slate-300 font-medium uppercase">{t('email')}</span>
									<span className="text-white font-medium truncate">{taxDetails.email}</span>
								</div>
								<div className="grid grid-cols-[80px_1fr] gap-3 text-xs">
									<span className="text-slate-300 font-medium uppercase">{t('address')}</span>
									<span className="text-white font-medium text-[10px] leading-tight">
										{taxDetails.address}
									</span>
								</div>
							</div>

							{/* Card Footer */}
							<div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pt-3 border-t border-white/10">
								<div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-xs font-bold text-blue-300">
									{taxDetails.activityCode}
								</div>
								<div className="text-[10px] text-slate-400 uppercase tracking-wide">
									{t('digitalInvoicing')}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tax Details Information */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
						<i className="i-material-symbols-info w-5! h-5! text-gray-600 dark:text-gray-300" />
						{t('contactInformation')}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('name')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">{taxDetails.name}</p>
							</div>

							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('id')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">{taxDetails.id}</p>
							</div>

							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('phone')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">{taxDetails.phone}</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('email')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">{taxDetails.email}</p>
							</div>

							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('activityCode')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">
									{taxDetails.activityCode}
								</p>
							</div>

							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('status')}
								</div>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										taxDetails.status
											? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
											: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
									}`}
								>
									{t(taxDetails.status ? 'active' : 'inactive')}
								</span>
							</div>
						</div>

						<div className="md:col-span-2">
							<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1">
									{t('address')}
								</div>
								<p className="text-gray-900 dark:text-white font-medium">{taxDetails.address}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(TaxDetails)
