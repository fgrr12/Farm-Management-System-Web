import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { TextField } from '@/components/ui/TextField'
import { Textarea } from '@/components/ui/Textarea'

import { ProductionRecordsService } from '@/services/productionRecords'
import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'

import type { ProductionRecord } from './ProductionRecordForm.types'

import * as S from './ProductionRecordForm.styles'

export const ProductionRecordForm = () => {
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [productionRecordForm, setProductionRecordForm] = useState<ProductionRecord>(
		INITIAL_PRODUCTION_RECORD_FORM
	)

	const handleBack = () => {
		navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
	}

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

			if (productionRecordUuid) {
				await ProductionRecordsService.updateProductionRecord(productionRecordForm)
				setModalData({
					open: true,
					title: 'Production Record Updated',
					message: 'The production record has been updated successfully',
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
					},
				})
			} else {
				ProductionRecordsService.setProductionRecord(productionRecordForm)
				setModalData({
					open: true,
					title: 'Animal Added',
					message: 'The production record has been added successfully',
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', productionRecordForm.animalUuid))
					},
				})
			}
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error adding the production record',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const getProductionRecord = useCallback(async () => {
		try {
			setLoading(true)
			const productionRecordUuid = params.productionRecordUuid as string
			const dbProductionRecord =
				await ProductionRecordsService.getProductionRecord(productionRecordUuid)
			setProductionRecordForm(dbProductionRecord)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error getting the health record',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}, [defaultModalData, params.productionRecordUuid, setModalData, setLoading])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (!UserService.isAuthenticated()) {
			navigate(AppRoutes.LOGIN)
			return
		}
		const animalUuid = params.animalUuid as string
		setProductionRecordForm((prev) => ({ ...prev, animalUuid }))
		if (params.productionRecordUuid) {
			getProductionRecord()
		}
	}, [])

	return (
		<S.Container>
			<PageHeader onBack={handleBack}>{t('addProductionRecord.title')}</PageHeader>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="quantity"
					type="number"
					placeholder={t('addProductionRecord.quantity')}
					label={t('addProductionRecord.quantity')}
					value={productionRecordForm.quantity}
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label={t('addProductionRecord.date')}
					date={dayjs(productionRecordForm.date)}
					onDateChange={handleDateChange()}
				/>
				<S.TextareaContainer>
					<Textarea
						name="notes"
						placeholder={t('addProductionRecord.notes')}
						label={t('addProductionRecord.notes')}
						value={productionRecordForm.notes}
						onChange={handleTextareaChange}
						required
					/>
				</S.TextareaContainer>
				<Button type="submit">{t('addProductionRecord.addProductionRecord')}</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_PRODUCTION_RECORD_FORM: ProductionRecord = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	quantity: 0,
	date: dayjs(),
	notes: '',
	status: true,
}
