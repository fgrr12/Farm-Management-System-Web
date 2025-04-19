import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { TextField } from '@/components/ui/TextField'
import { Textarea } from '@/components/ui/Textarea'

import { ProductionRecordsService } from '@/services/productionRecords'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const ProductionRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['productionRecordForm'])
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [productionRecordForm, setProductionRecordForm] = useState<ProductionRecord>(
		INITIAL_PRODUCTION_RECORD_FORM
	)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setProductionRecordForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setProductionRecordForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleDateChange = () => (newDate: dayjs.Dayjs) => {
		setProductionRecordForm((prev) => ({ ...prev, date: dayjs(newDate).format('YYYY-MM-DD') }))
	}

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()
			const productionRecordUuid = params.productionRecordUuid as string
			productionRecordForm.uuid = productionRecordUuid ?? crypto.randomUUID()

			if (productionRecordUuid) {
				await ProductionRecordsService.updateProductionRecord(productionRecordForm, user!.uuid)
				setModalData({
					open: true,
					title: t('modal.editProductionRecord.title'),
					message: t('modal.editProductionRecord.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
					},
				})
			} else {
				ProductionRecordsService.setProductionRecord(productionRecordForm, user!.uuid)
				setModalData({
					open: true,
					title: t('modal.addProductionRecord.title'),
					message: t('modal.addProductionRecord.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
					},
				})
			}
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorAddingProductionRecord.title'),
				message: t('modal.errorAddingProductionRecord.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const getProductionRecord = async () => {
		try {
			setLoading(true)
			const productionRecordUuid = params.productionRecordUuid as string
			const dbProductionRecord =
				await ProductionRecordsService.getProductionRecord(productionRecordUuid)
			setProductionRecordForm(dbProductionRecord)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorGettingProductionRecord.title'),
				message: t('modal.errorGettingProductionRecord.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (user) {
			const animalUuid = params.animalUuid as string
			setProductionRecordForm((prev) => ({ ...prev, animalUuid }))
			if (params.productionRecordUuid) {
				getProductionRecord()
			}
		}
	}, [user])

	useEffect(() => {
		const title = params.productionRecordUuid ? t('editProductionRecord') : t('addProductionRecord')
		setHeaderTitle(title)
	}, [setHeaderTitle, t, params.productionRecordUuid])

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
						onChange={handleTextareaChange}
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
