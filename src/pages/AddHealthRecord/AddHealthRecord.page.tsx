import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { Textarea } from '@/components/ui/Textarea'

import { HealthRecordsService } from '@/services/healthRecords'
import { useAppStore } from '@/store/useAppStore'

import type { HealthRecordForm } from './AddHealthRecord.types'

import * as S from './AddHealthRecord.styles'

export const AddHealthRecord = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useTranslation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [healthRecordForm, setHealthRecordForm] = useState<HealthRecordForm>(
		INITIAL_HEALTH_RECORD_FORM
	)

	const handleBack = () => {
		navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordForm.animalUuid))
	}

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setHealthRecordForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setHealthRecordForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setHealthRecordForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleDateChange = () => (newDate: dayjs.Dayjs) => {
		setHealthRecordForm((prev) => ({ ...prev, date: dayjs(newDate).format('YYYY-MM-DD') }))
	}

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()

			HealthRecordsService.setHealthRecord(healthRecordForm)

			setModalData({
				open: true,
				title: 'Animal Added',
				message: 'The health record has been added successfully',
				onAccept: () => {
					setModalData(defaultModalData)
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordForm.animalUuid))
				},
			})
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error adding the health record',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		const animalUuid = location.pathname.split('/').pop() ?? ''
		setHealthRecordForm((prev) => ({ ...prev, animalUuid }))
	}, [])

	return (
		<S.Container>
			<PageHeader onBack={handleBack}>{t('addHealthRecord.title')}</PageHeader>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="reason"
					type="text"
					placeholder={t('addHealthRecord.reason')}
					label={t('addHealthRecord.reason')}
					onChange={handleTextChange}
					required
				/>
				<Select name="type" label={t('addHealthRecord.type')} onChange={handleSelectChange}>
					{healthRecordTypes.map((type) => (
						<option key={type} value={type}>
							{t(`healthRecordType.${type.toLowerCase()}`)}
						</option>
					))}
				</Select>
				<TextField
					name="reviewedBy"
					type="text"
					placeholder={t('addHealthRecord.reviewedBy')}
					label={t('addHealthRecord.reviewedBy')}
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label={t('addHealthRecord.date')}
					date={dayjs()}
					onDateChange={handleDateChange()}
				/>
				<TextField
					name="weight"
					type="text"
					placeholder={t('addHealthRecord.weight')}
					label={t('addHealthRecord.weight')}
					onChange={handleTextChange}
				/>
				<TextField
					name="temperature"
					type="text"
					placeholder={t('addHealthRecord.temperature')}
					label={t('addHealthRecord.temperature')}
					onChange={handleTextChange}
				/>
				<TextField
					name="medication"
					type="text"
					placeholder={t('addHealthRecord.medication')}
					label={t('addHealthRecord.medication')}
					onChange={handleTextChange}
				/>
				<TextField
					name="dosage"
					type="text"
					placeholder={t('addHealthRecord.dosage')}
					label={t('addHealthRecord.dosage')}
					onChange={handleTextChange}
				/>
				<TextField
					name="frequency"
					type="text"
					placeholder={t('addHealthRecord.frequency')}
					label={t('addHealthRecord.frequency')}
					onChange={handleTextChange}
				/>
				<TextField
					name="duration"
					type="text"
					placeholder={t('addHealthRecord.duration')}
					label={t('addHealthRecord.duration')}
					onChange={handleTextChange}
				/>
				<S.TextareaContainer>
					<Textarea
						name="notes"
						placeholder={t('addHealthRecord.notes')}
						label={t('addHealthRecord.notes')}
						onChange={handleTextareaChange}
						required
					/>
				</S.TextareaContainer>
				<Button type="submit">{t('addHealthRecord.addHealthRecord')}</Button>
			</S.Form>
		</S.Container>
	)
}

const healthRecordTypes: HealthRecordType[] = [
	'Checkup',
	'Vaccination',
	'Medication',
	'Surgery',
	'Pregnant',
	'Deworming',
	'Birth',
]

const INITIAL_HEALTH_RECORD_FORM: HealthRecordForm = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	reason: '',
	notes: '',
	type: '',
	reviewedBy: '',
	date: dayjs(),
	weight: 0,
	temperature: 0,
	medication: '-',
	dosage: '-',
	frequency: '-',
	duration: '-',
	status: true,
}
