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
import { FormLayout } from '@/components/layout/FormLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useProductionRecordForm } from '@/hooks/forms/useProductionRecordForm'
import {
	useCreateProductionRecord,
	useUpdateProductionRecord,
} from '@/hooks/queries/useProductionRecords'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { ProductionRecordFormData } from '@/schemas'

const ProductionRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['productionRecordForm'])
	const { setPageTitle, showToast, withError, withLoadingAndError } = usePagePerformance()

	const createProductionRecord = useCreateProductionRecord()
	const updateProductionRecord = useUpdateProductionRecord()

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

			await withError(async () => {
				const productionRecordData = transformToApiFormat(data)
				const productionRecordUuid = params.productionRecordUuid
				productionRecordData.uuid = productionRecordUuid ?? crypto.randomUUID()

				if (productionRecordUuid) {
					// Update existing record
					await updateProductionRecord.mutateAsync({
						productionRecord: productionRecordData,
						userUuid: user.uuid,
					})
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				} else {
					// Create new record with optimistic update
					await createProductionRecord.mutateAsync({
						productionRecord: productionRecordData,
						userUuid: user.uuid,
					})
					showToast(t('toast.added'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				}
			}, t('toast.errorAddingProductionRecord'))
		},
		[
			user,
			params.productionRecordUuid,
			transformToApiFormat,
			createProductionRecord,
			updateProductionRecord,
			showToast,
			t,
			navigate,
			withError,
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

	const isEditing = !!params.productionRecordUuid

	return (
		<PageContainer maxWidth="3xl">
			<PageHeader
				icon="analytics"
				title={isEditing ? t('editProductionRecordTitle') : t('addProductionRecordTitle')}
				subtitle={isEditing ? t('editSubtitle') : t('addSubtitle')}
				variant="compact"
			/>

			<FormLayout
				sections={[
					{
						title: t('productionInformation'),
						icon: 'analytics',
						columns: 2,
						children: (
							<>
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
								/>

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
										/>
									)}
								/>
							</>
						),
					},
					{
						title: t('additionalNotes'),
						icon: 'notes',
						columns: 1,
						children: (
							<Textarea
								{...register('notes')}
								placeholder={t('placeholders.notes')}
								label={t('notes')}
								required
								error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
							/>
						),
					},
				]}
				onSubmit={handleSubmit(onSubmit)}
				submitButton={{
					label: isEditing ? t('editButton') : t('addButton'),
					isSubmitting,
					icon: isEditing ? 'edit' : 'add-chart',
				}}
			/>
		</PageContainer>
	)
}

export default memo(ProductionRecordForm)
