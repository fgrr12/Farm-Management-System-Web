import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import { useTaxCardPrintable } from './TaxCardPrintable'

const TaxDetails = () => {
	const { taxDetails } = useFarmStore()
	const { t } = useTranslation('taxDetails')
	const { setPageTitle } = usePagePerformance()
	const [isFlipped, setIsFlipped] = useState(false)
	const { handleDownloadCards } = useTaxCardPrintable({ taxDetails: taxDetails! })

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	if (!taxDetails) {
		return (
			<PageContainer maxWidth="4xl">
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
			</PageContainer>
		)
	}

	return (
		<PageContainer maxWidth="4xl">
			<PageHeader
				icon="receipt-long"
				title={t('title')}
				subtitle={t('subtitle')}
				variant="compact"
			/>

			{/* Tax Details Display */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Card Visual - Flippable */}
				<div className="flex flex-col items-center gap-6">
					<div className="relative perspective-1000">
						{/* Flip Card Container */}
						<button
							type="button"
							className={`relative w-92.5 h-53.75 transition-transform duration-700 transform-style-3d cursor-pointer ${
								isFlipped ? 'rotate-y-180' : ''
							}`}
							onClick={() => setIsFlipped(!isFlipped)}
							style={{
								transformStyle: 'preserve-3d',
								transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
							}}
						>
							{/* Front Side */}
							<div
								className="absolute inset-0 w-92.5 h-53.75 bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-5 shadow-2xl backface-hidden"
								style={{
									backfaceVisibility: 'hidden',
									fontFamily: 'Inter, Arial, sans-serif',
								}}
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

								{/* Main Content */}
								<div className="relative z-10 flex flex-col space-y-2">
									<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
										<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-13.75">
											{t('name')}
										</span>
										<span className="text-white font-semibold text-xs truncate">
											{taxDetails.name}
										</span>
									</div>

									<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
										<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-13.75">
											{t('id')}
										</span>
										<span className="text-white font-semibold text-xs">{taxDetails.id}</span>
									</div>

									<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
										<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-13.75">
											{t('phone')}
										</span>
										<span className="text-white font-semibold text-xs">{taxDetails.phone}</span>
									</div>

									<div className="grid grid-cols-[auto_1fr] gap-2 items-start">
										<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-13.75">
											{t('email')}
										</span>
										<span className="text-white font-semibold text-xs leading-tight break-all">
											{taxDetails.email}
										</span>
									</div>

									<div className="grid grid-cols-[auto_1fr] gap-2 items-start">
										<span className="text-slate-300 font-medium text-xs uppercase tracking-wide min-w-13.75">
											{t('address')}
										</span>
										<span className="text-white font-semibold text-xs leading-tight">
											{taxDetails.address}
										</span>
									</div>
								</div>
							</div>

							{/* Back Side - Activities */}
							<div
								className="absolute inset-0 w-92.5 h-53.75 bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-5 shadow-2xl"
								style={{
									backfaceVisibility: 'hidden',
									transform: 'rotateY(180deg)',
									fontFamily: 'Inter, Arial, sans-serif',
								}}
							>
								{/* Background Effects */}
								<div className="absolute inset-0 opacity-20">
									<div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
									<div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
								</div>

								{/* Activities Header */}
								<div className="relative z-10 text-center mb-3">
									<h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide">
										{t('activities')}
									</h3>
								</div>

								{/* Activities List */}
								<div className="relative z-10 space-y-2 overflow-y-auto max-h-40">
									{taxDetails.activities && taxDetails.activities.length > 0 ? (
										taxDetails.activities.map((activity, index) => (
											<div
												key={index}
												className="px-3 py-2 bg-blue-500/15 border border-blue-400/30 rounded grid grid-cols-[1fr_auto] gap-2 items-center"
											>
												<span className="text-white font-semibold text-xs truncate">
													{activity.name}
												</span>
												<span className="text-blue-200 font-bold text-xs bg-blue-500/20 px-2 py-0.5 rounded">
													{activity.code}
												</span>
											</div>
										))
									) : (
										<div className="text-center text-slate-300 text-xs py-8">
											{t('noActivities')}
										</div>
									)}
								</div>
							</div>
						</button>

						{/* Flip Indicator */}
						<div className="text-xs text-gray-500 dark:text-gray-400 flex justify-center items-center gap-1 mt-4">
							<i className="i-material-symbols-touch-app w-4! h-4!" />
							<span>{t('clickToFlip')}</span>
						</div>
					</div>

					{/* Download Buttons */}
					<div className="flex flex-col items-center gap-3 w-full">
						<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{t('downloadCards')}
						</p>
						<div className="flex flex-col gap-3 w-[90%]">
							<Button
								onClick={() => handleDownloadCards('dark')}
								className="btn btn-neutral flex items-center gap-2 px-5 py-2.5"
							>
								<i className="i-material-symbols-download w-5! h-5!" />
								{t('downloadDarkCards')}
							</Button>
							<Button
								onClick={() => handleDownloadCards('light')}
								className="btn btn-outline flex items-center gap-2 px-5 py-2.5"
							>
								<i className="i-material-symbols-download w-5! h-5!" />
								{t('downloadLightCards')}
							</Button>
						</div>
					</div>
				</div>

				{/* Card Information */}
				<div className="space-y-6">
					{/* Tax Details */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
							<i className="i-material-symbols-info w-5! h-5! text-blue-600" />
							{t('fiscalInformation')}
						</h3>
						<div className="space-y-3">
							<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<i className="i-material-symbols-person w-5! h-5! text-gray-600 dark:text-gray-400 shrink-0" />
								<div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('name')}</div>
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{taxDetails.name}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<i className="i-material-symbols-badge w-5! h-5! text-gray-600 dark:text-gray-400 shrink-0" />
								<div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('id')}</div>
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{taxDetails.id}
									</div>
								</div>
							</div>
							<div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
								<i className="i-material-symbols-work w-5! h-5! text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
								<div className="flex-1 min-w-0">
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
										{t('activities')}
									</div>
									<div className="space-y-2">
										{taxDetails.activities && taxDetails.activities.length > 0 ? (
											taxDetails.activities.map((activity, index) => (
												<div
													key={index}
													className="flex items-center justify-between text-sm font-medium text-gray-900 dark:text-gray-100"
												>
													<span>{activity.name}</span>
													<span className="text-blue-600 dark:text-blue-400 ml-2 shrink-0">
														{activity.code}
													</span>
												</div>
											))
										) : (
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{t('noActivities')}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

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
									{t('fiscalDirection')}
								</div>
								<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{taxDetails.address}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageContainer>
	)
}

export default memo(TaxDetails)
