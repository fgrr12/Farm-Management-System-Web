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
						color: white;
					}
					.card::before {
						content: '';
						position: absolute;
						top: 0;
						right: 0;
						width: 15mm;
						height: 15mm;
						background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
						border-radius: 50%;
						transform: translate(30%, -30%);
					}
					.card-header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 2mm;
					}
					.card-title {
						font-size: 6px;
						font-weight: 700;
						color: #e2e8f0;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						line-height: 1.2;
						flex: 1;
					}
					.farm-logo {
						width: 6mm;
						height: 6mm;
						background: rgba(255, 255, 255, 0.15);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						backdrop-filter: blur(10px);
						border: 1px solid rgba(255, 255, 255, 0.1);
						margin-left: 2mm;
					}
					.card-content {
						flex: 1;
						display: flex;
					}
					.card-main-info {
						flex: 1;
						display: flex;
						flex-direction: column;
						gap: 1mm;
					}
					.card-activity {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						margin-left: 2mm;
						min-width: 15mm;
					}
					.info-row {
						display: grid;
						grid-template-columns: 12mm 1fr;
						gap: 1mm;
						font-size: 5px;
						line-height: 1.2;
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
					.activity-label {
						font-size: 4px;
						font-weight: 600;
						color: #cbd5e1;
						text-transform: uppercase;
						letter-spacing: 0.3px;
						text-align: center;
						line-height: 1.1;
						margin-bottom: 1mm;
					}
					.activity-code {
						font-size: 6px;
						font-weight: 700;
						color: #3b82f6;
						background: rgba(59, 130, 246, 0.15);
						padding: 0.5mm 1mm;
						border-radius: 2px;
						border: 1px solid rgba(59, 130, 246, 0.3);
						text-align: center;
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
								<h3 class="card-title">${t('taxCardTitle')}<br>${t('electronicInvoicing')}</h3>
								<div class="farm-logo">
									🐔
								</div>
							</div>
							<div class="card-content">
								<div class="card-main-info">
									<div class="info-row">
										<span class="info-label">${t('id').toUpperCase()}</span>
										<span class="info-value">${taxDetails?.id || 'N/A'}</span>
									</div>
									<div class="info-row">
										<span class="info-label">${t('name').toUpperCase()}</span>
										<span class="info-value">${taxDetails?.name || 'N/A'}</span>
									</div>
									<div class="info-row">
										<span class="info-label">${t('phone').toUpperCase()}</span>
										<span class="info-value">${taxDetails?.phone || 'N/A'}</span>
									</div>
									<div class="info-row">
										<span class="info-label">${t('email').toUpperCase()}</span>
										<span class="info-value">${taxDetails?.email || 'N/A'}</span>
									</div>
									<div class="info-row">
										<span class="info-label">${t('address').toUpperCase()}</span>
										<span class="info-value">${taxDetails?.address || 'N/A'}</span>
									</div>
								</div>
								<div class="card-activity">
									<div class="activity-label">
										${t('economicActivity')}
									</div>
									<div class="activity-code">${taxDetails?.activityCode || 'N/A'}</div>
								</div>
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<i className="i-material-symbols-receipt-long bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{t('title')}
								</h1>
								<p className="text-purple-100 text-sm sm:text-base mt-1">{t('subtitle')}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Tax Details Display */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Card Visual */}
					<div className="flex justify-center">
						<div className="relative">
							{/* Credit Card Size Tax Card Design */}
							<div
								id="business-card"
								className="w-[340px] h-[215px] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-5 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden text-white"
								style={{ fontFamily: 'Inter, Arial, sans-serif' }}
							>
								{/* Background Effects */}
								<div className="absolute inset-0 opacity-20">
									<div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
									<div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
								</div>

								{/* Header */}
								<div className="relative z-10 flex justify-between items-start mb-4">
									<div className="flex-1">
										<h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide leading-tight">
											{t('taxCardTitle')}
											<br />
											<span className="text-blue-400">{t('electronicInvoicing')}</span>
										</h2>
									</div>
									<div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 ml-4">
										<img
											src="/assets/billing/hen.jpeg"
											alt="Farm"
											className="w-7 h-7 object-cover rounded-full"
											onError={(e) => {
												const target = e.target as HTMLImageElement
												target.style.display = 'none'
												const fallback = document.createElement('div')
												fallback.innerHTML = '🐓'
												fallback.className = 'text-sm'
												target.parentNode?.appendChild(fallback)
											}}
										/>
									</div>
								</div>

								{/* Main Content Area */}
								<div className="relative z-10 flex">
									{/* Left Side - Main Information */}
									<div className="flex-1 space-y-2">
										<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
											<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-[55px]">
												{t('name')}
											</span>
											<span className="text-white font-semibold text-xs truncate">
												{taxDetails.name}
											</span>
										</div>

										<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
											<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-[55px]">
												{t('id')}
											</span>
											<span className="text-white font-semibold text-xs">{taxDetails.id}</span>
										</div>

										<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
											<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-[55px]">
												{t('phone')}
											</span>
											<span className="text-white font-semibold text-xs">{taxDetails.phone}</span>
										</div>

										<div className="grid grid-cols-[auto_1fr] gap-2 items-start">
											<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-[55px]">
												{t('email')}
											</span>
											<span className="text-white font-semibold text-xs leading-tight break-all">
												{taxDetails.email}
											</span>
										</div>

										<div className="grid grid-cols-[auto_1fr] gap-2 items-start">
											<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-[55px]">
												{t('address')}
											</span>
											<span className="text-white font-semibold text-xs leading-tight">
												{taxDetails.address}
											</span>
										</div>
									</div>

									{/* Right Side - Activity Code */}
									<div className="flex flex-col items-center justify-center ml-4 min-w-[80px]">
										<div className="text-center">
											<div className="text-xs text-slate-300 uppercase tracking-wide font-medium leading-tight mb-1">
												{t('activityCode')}
											</div>
											<div className="px-2 py-1 bg-blue-500/30 border border-blue-400/50 rounded text-xs font-bold text-blue-200">
												{taxDetails.activityCode}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Card Information */}
					<div className="space-y-6">
						{/* Contact Information */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<i className="i-material-symbols-contact-mail w-5! h-5! text-blue-600" />
								{t('contactInformation')}
							</h3>
							<div className="space-y-4">
								<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
									<i className="i-material-symbols-mail w-5! h-5! text-gray-600 dark:text-gray-400" />
									<div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{t('email')}</div>
										<a
											href={`mailto:${taxDetails.email}`}
											className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
										>
											{taxDetails.email}
										</a>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
									<i className="i-material-symbols-phone w-5! h-5! text-gray-600 dark:text-gray-400" />
									<div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{t('phone')}</div>
										<a
											href={`tel:${taxDetails.phone}`}
											className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
										>
											{taxDetails.phone}
										</a>
									</div>
								</div>
							</div>
						</div>

						{/* Address Information */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<i className="i-material-symbols-location-on w-5! h-5! text-blue-600" />
								{t('address')}
							</h3>
							<div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<i className="i-material-symbols-home w-5! h-5! text-gray-600 dark:text-gray-400 mt-0.5" />
								<div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
										Dirección Fiscal
									</div>
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{taxDetails.address}
									</div>
								</div>
							</div>
						</div>

						{/* Tax Details */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<i className="i-material-symbols-info w-5! h-5! text-blue-600" />
								{t('fiscalInformation')}
							</h3>
							<div className="space-y-3">
								<div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('id')}</div>
									<div className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
										{taxDetails.id}
									</div>
								</div>
								<div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
										{t('activityCode')}
									</div>
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{taxDetails.activityCode}
									</div>
								</div>
							</div>
						</div>

						{/* Download Button */}
						<div className="flex justify-center">
							<Button
								onClick={handleDownloadCards}
								className="btn btn-primary flex items-center gap-2 px-6 py-3"
							>
								<i className="i-material-symbols-download w-5! h-5!" />
								{t('downloadCards')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(TaxDetails)
