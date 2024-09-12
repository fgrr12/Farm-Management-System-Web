import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { Textarea } from '@/components/ui/Textarea'

import { HealthRecordsService } from '@/services/healthRecords'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { HealthRecordFormType } from './HealthRecordForm.types'

import * as S from './HealthRecordForm.styles'

export const HealthRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['healthRecordForm'])
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()

	const [healthRecordForm, setHealthRecordForm] = useState(INITIAL_HEALTH_RECORD_FORM)

	const healthRecordTypes: HealthRecordFormType[] = [
		{ value: 'Checkup', name: t('healthRecordType.checkup') },
		{ value: 'Vaccination', name: t('healthRecordType.vaccination') },
		{ value: 'Medication', name: t('healthRecordType.medication') },
		{ value: 'Surgery', name: t('healthRecordType.surgery') },
		{ value: 'Pregnancy', name: t('healthRecordType.pregnancy') },
		{ value: 'Deworming', name: t('healthRecordType.deworming') },
		{ value: 'Birth', name: t('healthRecordType.birth') },
		{ value: 'Drying', name: t('healthRecordType.drying') },
	]

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
		setHealthRecordForm((prev) => ({ ...prev, date: dayjs(newDate).toISOString() }))
	}

	const getHealthRecord = async () => {
		try {
			setLoading(true)
			const healthRecordUuid = params.healthRecordUuid as string
			const dbHealthRecord = await HealthRecordsService.getHealthRecord(healthRecordUuid)
			setHealthRecordForm(dbHealthRecord)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorGettingHealthRecord.title'),
				message: t('modal.errorGettingHealthRecord.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()
			const healthRecordUuid = params.healthRecordUuid as string
			healthRecordForm.uuid = healthRecordUuid ?? crypto.randomUUID()

			if (healthRecordUuid) {
				await HealthRecordsService.updateHealthRecord(healthRecordForm, user!.uuid)
				setModalData({
					open: true,
					title: t('modal.editHealthRecord.title'),
					message: t('modal.editHealthRecord.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordForm.animalUuid))
					},
				})
			} else {
				await HealthRecordsService.setHealthRecord(healthRecordForm, user!.uuid)
				setModalData({
					open: true,
					title: t('modal.addHealthRecord.title'),
					message: t('modal.addHealthRecord.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordForm.animalUuid))
					},
				})
			}
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorAddingHealthRecord.title'),
				message: t('modal.errorAddingHealthRecord.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (user) {
			const animalUuid = params.animalUuid ?? ''
			setHealthRecordForm((prev) => ({ ...prev, animalUuid }))
			if (params.healthRecordUuid) {
				getHealthRecord()
			}
		}
	}, [user])

	useEffect(() => {
		const title = params.healthRecordUuid ? t('editHealthRecord') : t('addHealthRecord')
		setHeaderTitle(title)
	}, [setHeaderTitle, t, params.healthRecordUuid])

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="reason"
					type="text"
					placeholder={t('reason')}
					label={t('reason')}
					value={healthRecordForm.reason}
					onChange={handleTextChange}
					required
				/>
				<Select
					name="type"
					label={t('type')}
					defaultLabel={t('selectType')}
					value={healthRecordForm.type}
					items={healthRecordTypes}
					onChange={handleSelectChange}
					required
				/>

				<TextField
					name="reviewedBy"
					type="text"
					placeholder={t('reviewedBy')}
					label={t('reviewedBy')}
					value={healthRecordForm.reviewedBy}
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label={t('date')}
					date={dayjs(healthRecordForm.date)}
					onDateChange={handleDateChange()}
				/>
				<TextField
					name="weight"
					type="number"
					placeholder={`${t('weight')} (${farm?.weightUnit})`}
					label={`${t('weight')} (${farm?.weightUnit})`}
					value={healthRecordForm.weight}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
				/>
				<TextField
					name="temperature"
					type="number"
					placeholder={`${t('temperature')} (${farm?.temperatureUnit})`}
					label={`${t('temperature')} (${farm?.temperatureUnit})`}
					value={healthRecordForm.temperature}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
				/>
				<TextField
					name="medication"
					type="text"
					placeholder="-"
					label={t('medication')}
					value={healthRecordForm.medication}
					onChange={handleTextChange}
				/>
				<TextField
					name="dosage"
					type="text"
					placeholder="-"
					label={t('dosage')}
					value={healthRecordForm.dosage}
					onChange={handleTextChange}
				/>
				<TextField
					name="frequency"
					type="text"
					placeholder="-"
					label={t('frequency')}
					value={healthRecordForm.frequency}
					onChange={handleTextChange}
				/>
				<TextField
					name="duration"
					type="text"
					placeholder="-"
					label={t('duration')}
					value={healthRecordForm.duration}
					onChange={handleTextChange}
				/>
				<S.TextareaContainer>
					<Textarea
						name="notes"
						placeholder={t('notes')}
						label={t('notes')}
						value={healthRecordForm.notes}
						onChange={handleTextareaChange}
						required
					/>
				</S.TextareaContainer>
				<Button type="submit">{params.healthRecordUuid ? t('editButton') : t('addButton')}</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_HEALTH_RECORD_FORM: AnimalHealthRecord = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	reason: '',
	notes: '',
	type: '',
	reviewedBy: '',
	date: dayjs().toISOString(),
	weight: 0,
	temperature: 0,
	medication: '',
	dosage: '',
	frequency: '',
	duration: '',
	status: true,
}
