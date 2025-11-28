import dayjs from 'dayjs'
import { memo, useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { ProductionRecordsService } from '@/services/productionRecords'

import { DatePicker } from '@/components/layout/DatePicker'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useProductionRecordForm } from '@/hooks/forms/useProductionRecordForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { ProductionRecordFormData } from '@/schemas'

const ProductionRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['productionRecordForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const form = useProductionRecordForm()
	const {
		handleSubmit,
		control,
		setValue,
		register,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
	} = form

	const onSubmit = useCallback(
		async (data: ProductionRecordFormData) => {
			if (!user) return

			await withLoadingAndError(async () => {
				const productionRecordData = transformToApiFormat(data)
				const productionRecordUuid = params.productionRecordUuid
				productionRecordData.uuid = productionRecordUuid ?? crypto.randomUUID()

				if (productionRecordUuid) {
					await ProductionRecordsService.updateProductionRecord(
						productionRecordData,
						user.uuid,
						farm!.uuid
					)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				} else {
					await ProductionRecordsService.setProductionRecord(
						productionRecordData,
						user.uuid,
						farm!.uuid
					)
					showToast(t('toast.added'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				}
			}, t('toast.errorAddingProductionRecord'))
		},
		[
			farm,
			user,
			params.productionRecordUuid,
			transformToApiFormat,
			withLoadingAndError,
			showToast,
			t,
			navigate,
		]
	)

	const getProductionRecord = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.productionRecordUuid) return null

			const productionRecordUuid = params.productionRecordUuid
			const productionRecord =
				await ProductionRecordsService.getProductionRecord(productionRecordUuid)
			resetWithData(productionRecord)
			return productionRecord
		}, t('toast.errorGettingProductionRecord'))
	}, [params.productionRecordUuid, withLoadingAndError, t, resetWithData])

	useEffect(() => {
		if (!user) return
		const animalUuid = params.animalUuid
		setValue('animalUuid', animalUuid || '')
		if (params.productionRecordUuid) {
			getProductionRecord()
		}
	}, [user, params.animalUuid, params.productionRecordUuid, getProductionRecord, setValue])

	useEffect(() => {
		setPageTitle(
			params.productionRecordUuid ? t('editProductionRecordTitle') : t('addProductionRecordTitle')
		)
	}, [params.productionRecordUuid, setPageTitle, t])

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#production-record-form"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToForm')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-linear-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
								<i className="i-material-symbols-analytics bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{params.productionRecordUuid
										? t('editProductionRecordTitle')
										: t('addProductionRecordTitle')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">
									{params.productionRecordUuid ? t('editSubtitle') : t('addSubtitle')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
					<form
						id="production-record-form"
						className="p-4 sm:p-6 lg:p-8"
						onSubmit={handleSubmit(onSubmit)}
						autoComplete="off"
						aria-labelledby="form-heading"
						noValidate
					>
						<h2 id="form-heading" className="sr-only">
							{params.productionRecordUuid
								? t('accessibility.editProductionRecordForm')
								: t('accessibility.addProductionRecordForm')}
						</h2>

						<div className="space-y-6">
							{/* Production Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-analytics bg-blue-600! w-5! h-5!" />
									{t('productionInformation')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<TextField
										{...register('quantity', { valueAsNumber: true })}
										type="number"
										placeholder={t('placeholders.quantity')}
										label={`${t('quantity')} (${farm?.liquidUnit})`}
										onWheel={(e) => e.currentTarget.blur()}
										required
										error={
											errors.quantity ? getErrorMessage(errors.quantity.message || '') : undefined
										}
										min="0"
										step="0.1"
										aria-describedby="quantity-help"
									/>
									<div id="quantity-help" className="sr-only">
										{t('accessibility.quantityHelp')}
									</div>

									<Controller
										name="date"
										control={control}
										render={({ field }) => (
											<DatePicker
												legend={t('date')}
												label={t('date')}
												date={dayjs(field.value)}
												onDateChange={(date) => {
													field.onChange(dayjs(date).format('YYYY-MM-DD'))
												}}
												error={errors.date ? getErrorMessage(errors.date.message || '') : undefined}
												aria-describedby="date-help"
											/>
										)}
									/>
									<div id="date-help" className="sr-only">
										{t('accessibility.dateHelp')}
									</div>
								</div>
							</div>

							{/* Additional Notes Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-notes bg-blue-600! w-5! h-5!" />
									{t('additionalNotes')}
								</h3>
								<Textarea
									{...register('notes')}
									placeholder={t('placeholders.notes')}
									label={t('notes')}
									required
									error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
									aria-describedby="notes-help"
								/>
								<div id="notes-help" className="sr-only">
									{t('accessibility.notesHelp')}
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								disabled={isSubmitting}
								aria-describedby="submit-help"
								className="btn btn-primary h-12 w-full text-lg disabled:loading flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<>
										<i className="i-material-symbols-hourglass-empty w-5! h-5! animate-spin" />
										{t('common:loading')}
									</>
								) : (
									<>
										<i className="i-material-symbols-add-chart w-5! h-5!" />
										{params.productionRecordUuid ? t('editButton') : t('addButton')}
									</>
								)}
							</Button>
							<div id="submit-help" className="sr-only">
								{t('accessibility.submitHelp')}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default memo(ProductionRecordForm)
