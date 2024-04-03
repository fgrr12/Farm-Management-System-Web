import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { TextField } from '@/components/ui/TextField'
import { Textarea } from '@/components/ui/Textarea'

import { useAppStore } from '@/store/useAppStore'

import type { ProductionRecordForm } from './AddProductionRecord.types'

import { ProductionRecordsService } from '@/services/productionRecords'
import * as S from './AddProductionRecord.styles'

export const AddProductionRecord = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useTranslation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [productionRecordForm, setProductionRecordForm] = useState<ProductionRecordForm>(
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		const animalUuid = location.pathname.split('/').pop() ?? ''
		setProductionRecordForm((prev) => ({ ...prev, animalUuid }))
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
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label={t('addProductionRecord.date')}
					date={dayjs()}
					onDateChange={handleDateChange()}
				/>
				<S.TextareaContainer>
					<Textarea
						name="notes"
						placeholder={t('addProductionRecord.notes')}
						label={t('addProductionRecord.notes')}
						onChange={handleTextareaChange}
						required
					/>
				</S.TextareaContainer>
				<Button type="submit">{t('addProductionRecord.addProductionRecord')}</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_PRODUCTION_RECORD_FORM: ProductionRecordForm = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	quantity: 0,
	date: dayjs(),
	notes: '',
}
