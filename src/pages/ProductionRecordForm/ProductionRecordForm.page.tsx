import dayjs from 'dayjs'
import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { ProductionRecordsService } from '@/services/productionRecords'

import { DatePicker } from '@/components/layout/DatePicker'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

const ProductionRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['productionRecordForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()
	const [productionRecordForm, setProductionRecordForm] = useState<ProductionRecord>(
		INITIAL_PRODUCTION_RECORD_FORM
	)

	const handleTextChange = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = event.target
			setProductionRecordForm((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
		},
		[]
	)

	const handleDateChange = useCallback(
		() => (newDate: dayjs.Dayjs | null) => {
			setProductionRecordForm((prev) => ({ ...prev, date: dayjs(newDate).format('YYYY-MM-DD') }))
		},
		[]
	)

	const handleSubmit = useCallback(
		async (event: FormEvent) => {
			if (!user) return

			event.preventDefault()

			await withLoadingAndError(async () => {
				const productionRecordUuid = params.productionRecordUuid as string
				productionRecordForm.uuid = productionRecordUuid ?? crypto.randomUUID()

				if (productionRecordUuid) {
					await ProductionRecordsService.updateProductionRecord(productionRecordForm, user.uuid)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
				} else {
					await ProductionRecordsService.setProductionRecord(productionRecordForm, user.uuid)
					showToast(t('toast.added'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
				}
			}, t('toast.errorAddingProductionRecord'))
		},
		[
			user,
			params.productionRecordUuid,
			productionRecordForm,
			withLoadingAndError,
			showToast,
			t,
			navigate,
		]
	)

	const getProductionRecord = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.productionRecordUuid) return null

			const productionRecordUuid = params.productionRecordUuid as string
			const dbProductionRecord =
				await ProductionRecordsService.getProductionRecord(productionRecordUuid)
			setProductionRecordForm(dbProductionRecord)
			return dbProductionRecord
		}, t('toast.errorGettingProductionRecord'))
	}, [params.productionRecordUuid, withLoadingAndError, t])

	useEffect(() => {
		if (!user) return
		const animalUuid = params.animalUuid as string
		setProductionRecordForm((prev) => ({ ...prev, animalUuid }))
		if (params.productionRecordUuid) {
			getProductionRecord()
		}
	}, [user, params.animalUuid, params.productionRecordUuid, getProductionRecord])

	useEffect(() => {
		const title = params.productionRecordUuid ? t('editProductionRecord') : t('addProductionRecord')
		setPageTitle(title)
	}, [setPageTitle, t, params.productionRecordUuid])

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<TextField
					name="quantity"
					type="number"
					placeholder={`${t('quantity')} (${farm?.liquidUnit})`}
					label={`${t('quantity')} (${farm?.liquidUnit})`}
					value={productionRecordForm.quantity}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
					required
				/>
				<DatePicker
					legend={t('date')}
					label={t('date')}
					date={dayjs(productionRecordForm.date)}
					onDateChange={handleDateChange()}
				/>
				<div className="col-span-2 w-full">
					<Textarea
						name="notes"
						placeholder={t('notes')}
						label={t('notes')}
						value={productionRecordForm.notes}
						onChange={handleTextChange}
						required
					/>
				</div>
				<div className="col-span-2 w-full">
					<Button type="submit">
						{params.productionRecordUuid ? t('editButton') : t('addButton')}
					</Button>
				</div>
			</form>
		</div>
	)
}

const INITIAL_PRODUCTION_RECORD_FORM: ProductionRecord = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	quantity: 0,
	date: dayjs().toISOString(),
	notes: '',
	status: true,
}

export default memo(ProductionRecordForm)
