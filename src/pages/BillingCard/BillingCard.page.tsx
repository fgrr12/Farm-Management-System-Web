import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'

import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const BillingCard = () => {
	const { billingCard } = useFarmStore()
	const { t } = useTranslation('billingCard')
	const { setPageTitle } = usePagePerformance()

	const handleDownloadCards = useCallback(() => {
		const printWindow = window.open('', '_blank')
		if (!printWindow) return

		const cardHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>${t('title')} - ${billingCard?.name}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body { 
						font-family: Arial, sans-serif; 
						background: white;
						padding: 20px;
					}
					.page {
						width: 210mm;
						min-height: 297mm;
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						grid-template-rows: repeat(5, 1fr);
						gap: 10mm;
						margin: 0 auto;
					}
					.card {
						width: 85mm;
						height: 55mm;
						border: 2px solid #374151;
						border-radius: 12px;
						padding: 4mm 6mm 4mm 6mm;
						background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						position: relative;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					}
					.card-title {
						text-align: center;
						font-size: 10px;
						font-weight: bold;
						color: #111827;
						margin-bottom: 1.5mm;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						line-height: 1.3;
					}
					.card-title .highlight {
						color: #2563eb;
					}
					.title-divider {
						width: 10mm;
						height: 0.5px;
						background: linear-gradient(to right, #2563eb, #7c3aed);
						margin: 0.8mm auto 2mm auto;
						border-radius: 1px;
					}
					.info-row {
						display: flex;
						align-items: flex-start;
						margin-bottom: 1.2mm;
						font-size: 9px;
						color: #111827;
					}
					.info-label {
						font-weight: bold;
						min-width: 16mm;
						margin-right: 1.5mm;
						color: #374151;
					}
					.info-value {
						flex: 1;
						word-break: break-word;
						font-weight: 500;
					}
					.chicken-icon {
						position: absolute;
						bottom: 4mm;
						right: 4mm;
						width: 12mm;
						height: 12mm;
						background: white;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
						padding: 1mm;
					}
					@media print {
						body { padding: 0; }
						.page { margin: 0; }
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
							<div class="card-title">
								${t('billingCardTitle')}<br>
								<span class="highlight">${t('electronic')}</span>
							</div>
							<div class="title-divider"></div>
							<div class="info-row">
								<span class="info-label">${t('name')}:</span>
								<span class="info-value">${billingCard?.name || 'N/A'}</span>
							</div>
							<div class="info-row">
								<span class="info-label">${t('phone')}:</span>
								<span class="info-value">${billingCard?.phone || 'N/A'}</span>
							</div>
							<div class="info-row">
								<span class="info-label">${t('idNumber')}:</span>
								<span class="info-value">${billingCard?.id || 'N/A'}</span>
							</div>
							<div class="info-row">
								<span class="info-label">${t('email')}:</span>
								<span class="info-value">${billingCard?.email || 'N/A'}</span>
							</div>
							<div class="info-row">
								<span class="info-label">${t('address')}:</span>
								<span class="info-value">${billingCard?.address || 'N/A'}</span>
							</div>
							<div class="chicken-icon">
								<img src="/assets/billing/hen.jpeg" alt="Hen" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
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
	}, [billingCard, t])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	if (!billingCard) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
				<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
					<div className="flex flex-col items-center justify-center py-12">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<i className="i-material-symbols-credit-card w-8! h-8! text-gray-400" />
						</div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
							{t('noBillingCard')}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
							{t('noBillingCardMessage')}
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
								<i className="i-material-symbols-credit-card bg-white! w-6! h-6! sm:w-8 sm:h-8" />
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

				{/* Billing Card Display */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Card Visual */}
					<div className="flex justify-center">
						<div className="relative">
							{/* Modern Billing Card Design */}
							<div
								id="business-card"
								className="w-[400px] h-[260px] bg-gradient-to-br from-white to-gray-50 border-2 border-gray-700 rounded-xl pt-4 px-6 pb-4 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
								style={{ fontFamily: 'Inter, Arial, sans-serif' }}
							>
								{/* Subtle background pattern */}
								<div className="absolute inset-0 opacity-5">
									<div className="absolute top-4 right-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
									<div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl" />
								</div>

								{/* Title */}
								<div className="text-center mb-4 relative z-1">
									<h2 className="text-base font-bold text-gray-900 uppercase tracking-wide leading-tight">
										{t('billingCardTitle')}
										<br />
										<span className="text-blue-600">{t('electronic')}</span>
									</h2>
									<div className="w-14 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-1.5 rounded-full" />
								</div>

								{/* Information Grid */}
								<div className="space-y-2.5 relative z-1">
									<div className="flex items-center">
										<span className="font-bold text-gray-900 min-w-[85px] text-base">
											{t('name')}:
										</span>
										<span className="text-gray-800 text-base ml-2 font-medium">
											{billingCard.name}
										</span>
									</div>
									<div className="flex items-center">
										<span className="font-bold text-gray-900 min-w-[85px] text-base">
											{t('phone')}:
										</span>
										<span className="text-gray-800 text-base ml-2 font-medium">
											{billingCard.phone}
										</span>
									</div>
									<div className="flex items-center">
										<span className="font-bold text-gray-900 min-w-[85px] text-base">
											{t('id')}:
										</span>
										<span className="text-gray-800 text-base ml-2 font-medium">
											{billingCard.id}
										</span>
									</div>
									<div className="flex items-start">
										<span className="font-bold text-gray-900 min-w-[85px] text-base">
											{t('email')}:
										</span>
										<span className="text-gray-800 text-base ml-2 font-medium break-all">
											{billingCard.email}
										</span>
									</div>
									<div className="flex items-start">
										<span className="font-bold text-gray-900 min-w-[85px] text-base">
											{t('address')}:
										</span>
										<span className="text-gray-800 text-base ml-2 font-medium leading-relaxed">
											{billingCard.address}
										</span>
									</div>
								</div>

								{/* Chicken Image */}
								<div className="absolute bottom-4 right-4 z-1">
									<div className="w-14 h-14 bg-white rounded-full p-1 shadow-lg">
										<img
											src="/assets/billing/hen.jpeg"
											alt="Hen"
											className="w-full h-full object-cover rounded-full"
										/>
									</div>
								</div>

								{/* Corner accent */}
								<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
								<div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />
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
											href={`mailto:${billingCard.email}`}
											className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
										>
											{billingCard.email}
										</a>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
									<i className="i-material-symbols-phone w-5! h-5! text-gray-600 dark:text-gray-400" />
									<div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{t('phone')}</div>
										<a
											href={`tel:${billingCard.phone}`}
											className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
										>
											{billingCard.phone}
										</a>
									</div>
								</div>
							</div>
						</div>

						{/* Billing Address */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<i className="i-material-symbols-location-on w-5! h-5! text-blue-600" />
								{t('billingAddress')}
							</h3>
							<div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<i className="i-material-symbols-home w-5! h-5! text-gray-600 dark:text-gray-400 mt-0.5" />
								<div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
										{t('address')}
									</div>
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{billingCard.address}
									</div>
								</div>
							</div>
						</div>

						{/* Card Details */}
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<i className="i-material-symbols-info w-5! h-5! text-blue-600" />
								{t('cardDetails')}
							</h3>
							<div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cardId')}</div>
								<div className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
									{billingCard.id}
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

export default memo(BillingCard)
