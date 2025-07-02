import dayjs from 'dayjs'
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { HealthRecordsService } from '@/services/healthRecords'

import { DatePicker } from '@/components/layout/DatePicker'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import type { HealthRecordFormType } from './HealthRecordForm.types'

// Custom hook for form state management
const useHealthRecordForm = (initialForm: HealthRecord) => {
	const [form, setForm] = useState(initialForm)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleDateChange = () => (newDate: dayjs.Dayjs | null) => {
		setForm((prev) => ({
			...prev,
			date: newDate ? dayjs(newDate).toISOString() : dayjs().toISOString(),
		}))
	}

	return { form, setForm, handleTextChange, handleSelectChange, handleDateChange }
}

// Custom hook for form submission
const useHealthRecordSubmit = (form: HealthRecord, userUuid: string, navigate: any) => {
	const { t } = useTranslation(['healthRecordForm'])
	const { setLoading, setToastData } = useAppStore()
	const params = useParams()

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()
			const healthRecordUuid = params.healthRecordUuid as string
			form.uuid = healthRecordUuid ?? crypto.randomUUID()

			if (healthRecordUuid) {
				await HealthRecordsService.updateHealthRecord(form, userUuid)
				setToastData({
					message: t('toast.editHealthRecord'),
					type: 'success',
				})
				navigate(AppRoutes.ANIMAL.replace(':animalUuid', form.animalUuid))
			} else {
				await HealthRecordsService.setHealthRecord(form, userUuid)
				setToastData({
					message: t('toast.addHealthRecord'),
					type: 'success',
				})
				navigate(AppRoutes.ANIMAL.replace(':animalUuid', form.animalUuid))
			}
		} catch (_error) {
			setToastData({
				message: t('toast.errorAddingHealthRecord'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	return handleSubmit
}

const HealthRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['healthRecordForm'])
	const { setLoading, setToastData, setHeaderTitle } = useAppStore()

	const { form, setForm, handleTextChange, handleSelectChange, handleDateChange } =
		useHealthRecordForm(INITIAL_HEALTH_RECORD_FORM)

	const healthRecordTypes: HealthRecordFormType[] = useMemo(
		() => [
			{ value: 'Checkup', name: t('healthRecordType.checkup') },
			{ value: 'Vaccination', name: t('healthRecordType.vaccination') },
			{ value: 'Medication', name: t('healthRecordType.medication') },
			{ value: 'Surgery', name: t('healthRecordType.surgery') },
			{ value: 'Pregnancy', name: t('healthRecordType.pregnancy') },
			{ value: 'Deworming', name: t('healthRecordType.deworming') },
			{ value: 'Birth', name: t('healthRecordType.birth') },
			{ value: 'Drying', name: t('healthRecordType.drying') },
		],
		[t]
	)

	const handleSubmit = useHealthRecordSubmit(form, user!.uuid, navigate)

	const getHealthRecord = async () => {
		try {
			setLoading(true)
			const healthRecordUuid = params.healthRecordUuid as string
			const dbHealthRecord = await HealthRecordsService.getHealthRecord(healthRecordUuid)
			setForm(dbHealthRecord)
		} catch (_error) {
			setToastData({
				message: t('toast.errorGettingHealthRecord'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		if (user) {
			const animalUuid = params.animalUuid ?? ''
			setForm((prev) => ({ ...prev, animalUuid }))
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
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[800px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<TextField
					name="reason"
					type="text"
					placeholder={t('reason')}
					label={t('reason')}
					value={form.reason}
					onChange={handleTextChange}
					required
				/>
				<Select
					name="type"
					legend={t('selectType')}
					defaultLabel={t('selectType')}
					value={form.type}
					items={healthRecordTypes}
					onChange={handleSelectChange}
					required
				/>

				<TextField
					name="reviewedBy"
					type="text"
					placeholder={t('reviewedBy')}
					label={t('reviewedBy')}
					value={form.reviewedBy}
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					legend={t('date')}
					label={t('date')}
					date={dayjs(form.date)}
					onDateChange={handleDateChange()}
				/>
				<TextField
					name="weight"
					type="number"
					placeholder={`${t('weight')} (${farm?.weightUnit})`}
					label={`${t('weight')} (${farm?.weightUnit})`}
					value={form.weight}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
				/>
				<TextField
					name="temperature"
					type="number"
					placeholder={`${t('temperature')} (${farm?.temperatureUnit})`}
					label={`${t('temperature')} (${farm?.temperatureUnit})`}
					value={form.temperature}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
				/>
				<TextField
					name="medication"
					type="text"
					placeholder="-"
					label={t('medication')}
					value={form.medication}
					onChange={handleTextChange}
				/>
				<TextField
					name="dosage"
					type="text"
					placeholder="-"
					label={t('dosage')}
					value={form.dosage}
					onChange={handleTextChange}
				/>
				<TextField
					name="frequency"
					type="text"
					placeholder="-"
					label={t('frequency')}
					value={form.frequency}
					onChange={handleTextChange}
				/>
				<TextField
					name="duration"
					type="text"
					placeholder="-"
					label={t('duration')}
					value={form.duration}
					onChange={handleTextChange}
				/>
				<div className="col-span-2 w-full">
					<Textarea
						name="notes"
						placeholder={t('notes')}
						label={t('notes')}
						value={form.notes}
						onChange={handleTextChange}
						required
					/>
				</div>

				<button type="submit" className="btn btn-primary h-12 w-full text-lg col-span-2">
					{params.healthRecordUuid ? t('editButton') : t('addButton')}
				</button>
			</form>
		</div>
	)
}

const INITIAL_HEALTH_RECORD_FORM: HealthRecord = {
	uuid: crypto.randomUUID(),
	animalUuid: '',
	reason: '',
	notes: '',
	type: '',
	reviewedBy: '',
	createdBy: '',
	date: dayjs().toISOString(),
	weight: 0,
	temperature: 0,
	medication: '',
	dosage: '',
	frequency: '',
	duration: '',
	status: true,
}

export default HealthRecordForm
