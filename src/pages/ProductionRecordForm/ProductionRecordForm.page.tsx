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
					await ProductionRecordsService.updateProductionRecord(productionRecordData, user.uuid)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				} else {
					await ProductionRecordsService.setProductionRecord(productionRecordData, user.uuid)
					showToast(t('toast.added'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordData.animalUuid))
				}
			}, t('toast.errorAddingProductionRecord'))
		},
		[
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
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
				noValidate
			>
				<TextField
					{...register('quantity', { valueAsNumber: true })}
					type="number"
					placeholder={`${t('quantity')} (${farm?.liquidUnit})`}
					label={`${t('quantity')} (${farm?.liquidUnit})`}
					onWheel={(e) => e.currentTarget.blur()}
					required
					error={errors.quantity ? getErrorMessage(errors.quantity.message || '') : undefined}
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
				<div className="col-span-2 w-full">
					<Textarea
						{...register('notes')}
						placeholder={t('notes')}
						label={t('notes')}
						required
						error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
					/>
				</div>
				<div className="col-span-2 w-full">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? t('common:loading')
							: params.productionRecordUuid
								? t('editButton')
								: t('addButton')}
					</Button>
				</div>
			</form>
		</div>
	)
}

export default memo(ProductionRecordForm)
