import dayjs from 'dayjs'
import { type ChangeEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import { HealthRecordsService } from '@/services/healthRecords'

import { DatePicker } from '@/components/layout/DatePicker'
import { ActionButton } from '@/components/ui/ActionButton'
import { Select } from '@/components/ui/Select'

import type { HealthRecordsFilters, HealthRecordsTableProps } from './HealthRecordsTable.types'

const trBgColor = (reason: HealthRecordType) => {
	switch (reason) {
		case 'Checkup':
			return 'bg-sky-100'
		case 'Vaccination':
			return 'bg-emerald-100'
		case 'Medication':
			return 'bg-teal-100'
		case 'Surgery':
			return 'bg-indigo-100'
		case 'Pregnancy':
			return 'bg-rose-200'
		case 'Deworming':
			return 'bg-pink-100'
		case 'Birth':
			return 'bg-yellow-100'
		case 'Drying':
			return 'bg-orange-100'
	}
}

export const HealthRecordsTable: FC<HealthRecordsTableProps> = ({
	haveUser,
	farm,
	healthRecords,
	employees,
	removeHealthRecord,
}) => {
	const { defaultModalData, setToastData, setModalData, setLoading } = useAppStore()
	const { user } = useUserStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalHealthRecords'])

	const [filters, setFilters] = useState<HealthRecordsFilters>(INITIAL_FILTERS)

	const { healthRecordsFiltered } = useMemo(() => {
		return {
			healthRecordsFiltered: healthRecords.filter((healthRecord) => {
				const matchesDate =
					filters.fromDate === null ||
					filters.toDate === null ||
					(dayjs(healthRecord.date).isAfter(dayjs(filters.fromDate)) &&
						dayjs(healthRecord.date).isBefore(dayjs(filters.toDate)))
				const matchesType = filters.type === '' || healthRecord.type === filters.type
				const matchesReviewedBy =
					filters.createdBy === '' ||
					(filters.createdBy === 'Me' && healthRecord.createdBy === user?.uuid) ||
					healthRecord.createdBy === filters.createdBy
				return matchesType && matchesReviewedBy && matchesDate
			}),
		}
	}, [healthRecords, filters, user])

	const additionalInfoExists = (healthRecord: HealthRecord) => {
		return (
			healthRecord.weight! > 0 ||
			healthRecord.temperature! > 0 ||
			healthRecord.medication ||
			healthRecord.dosage ||
			healthRecord.frequency ||
			healthRecord.duration
		)
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}

	const handleDateChange = (name: string) => (date: dayjs.Dayjs | null) => {
		setFilters((prev) => ({ ...prev, [name]: date }))
	}

	const handleAddHealthRecord = () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.ADD_HEALTH_RECORD.replace(':animalUuid', animalUuid)
		navigate(path)
	}

	const handleEditHealthRecord = (uuid: string) => () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.EDIT_HEALTH_RECORD.replace(':animalUuid', animalUuid).replace(
			':healthRecordUuid',
			uuid
		)
		navigate(path)
	}

	const handleDeleteHealthRecord = (uuid: string) => async () => {
		setModalData({
			open: true,
			title: t('modal.deleteHealthRecord.title'),
			message: t('modal.deleteHealthRecord.message'),
			onAccept: async () => {
				try {
					setLoading(true)
					await HealthRecordsService.updateHealthRecordsStatus(uuid, false)
					removeHealthRecord(uuid)
					setModalData(defaultModalData)
					setLoading(false)
					setToastData({
						message: t('toast.deleted'),
						type: 'success',
					})
				} catch (_error) {
					setToastData({
						message: t('toast.deleteError'),
						type: 'error',
					})
				}
			},
			onCancel: () => {
				setModalData(defaultModalData)
				setToastData({
					message: t('toast.notDeleted'),
					type: 'info',
				})
			},
		})
	}

	return (
		<div className="w-full xl:w-auto">
			{user && (
				<div className="w-full">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
						<DatePicker
							legend={t('filter.fromDate')}
							label={t('filter.fromDate')}
							date={dayjs(filters.fromDate)}
							onDateChange={handleDateChange('fromDate')}
						/>
						<DatePicker
							legend={t('filter.toDate')}
							label={t('filter.toDate')}
							date={dayjs(filters.toDate)}
							onDateChange={handleDateChange('toDate')}
						/>
						<Select
							name="type"
							legend={t('filter.type')}
							defaultLabel={t('filter.type')}
							value={filters.type}
							items={[
								{ value: 'Checkup', name: t('healthRecordType.checkup') },
								{ value: 'Vaccination', name: t('healthRecordType.vaccination') },
								{ value: 'Medication', name: t('healthRecordType.medication') },
								{ value: 'Surgery', name: t('healthRecordType.surgery') },
								{ value: 'Pregnancy', name: t('healthRecordType.pregnancy') },
								{ value: 'Deworming', name: t('healthRecordType.deworming') },
								{ value: 'Birth', name: t('healthRecordType.birth') },
								{ value: 'Drying', name: t('healthRecordType.drying') },
							]}
							onChange={handleSelectChange}
						/>
						{(user.role === 'admin' || user.role === 'owner') && (
							<Select
								name="createdBy"
								legend={t('filter.createdBy')}
								defaultLabel={t('filter.createdBy')}
								value={filters.createdBy}
								items={[
									{ value: 'Me', name: t('createdBy.me') },
									...employees.map((employee) => ({
										value: employee.uuid,
										name: employee.name,
									})),
								]}
								onChange={handleSelectChange}
							/>
						)}
					</div>
				</div>
			)}

			<div className="flex justify-center items-center">
				<div className="font-bold">{t('title')}</div>
				{haveUser && (
					<ActionButton
						title="Add Health Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</div>
			<div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
				<table className="table">
					<thead>
						<tr>
							<th>{t('reason')}</th>
							<th>{t('notes')}</th>
							<th>{t('type')}</th>
							<th>{t('reviewedBy')}</th>
							<th>{t('date')}</th>
							{haveUser && <th>{t('actions')}</th>}
						</tr>
					</thead>
					<tbody>
						{healthRecordsFiltered.map((healthRecord) => (
							<tr key={healthRecord.uuid} className={trBgColor(healthRecord.type)}>
								<td className="text-black">{healthRecord.reason}</td>
								<td className="text-black">
									<div className="flex flex-col gap-1">
										<span>{healthRecord.notes}</span>
										{additionalInfoExists(healthRecord) && (
											<span className="text-sm text-gray-600 mt-4">{t('additionalInfo')}</span>
										)}
										{healthRecord.weight! > 0 && (
											<span>
												{t('weight')}: {healthRecord.weight} {farm!.weightUnit}
											</span>
										)}
										{healthRecord.temperature! > 0 && (
											<span>
												{t('temperature')}: {healthRecord.temperature} {farm!.temperatureUnit}
											</span>
										)}
										{healthRecord.medication && (
											<span>
												{t('medication')}: {healthRecord.medication}
											</span>
										)}
										{healthRecord.dosage && (
											<span>
												{t('dosage')}: {healthRecord.dosage}
											</span>
										)}
										{healthRecord.frequency && (
											<span>
												{t('frequency')}: {healthRecord.frequency}
											</span>
										)}
										{healthRecord.duration && (
											<span>
												{t('duration')}: {healthRecord.duration}
											</span>
										)}
									</div>
								</td>
								<td className="text-black">
									{t(`healthRecordType.${healthRecord.type.toLowerCase()}`)}
								</td>
								<td className="text-black">{healthRecord.reviewedBy}</td>
								<td className="text-black">{dayjs(healthRecord.date).format('DD/MM/YYYY')}</td>
								{haveUser && (
									<td>
										<ActionButton
											title="Edit"
											icon="i-material-symbols-edit-square-outline"
											onClick={handleEditHealthRecord(healthRecord.uuid)}
										/>
										<ActionButton
											title="Delete"
											icon="i-material-symbols-delete-outline"
											onClick={handleDeleteHealthRecord(healthRecord.uuid)}
										/>
									</td>
								)}
							</tr>
						))}
						{healthRecordsFiltered.length === 0 && (
							<tr>
								<td className="text-center font-bold" colSpan={haveUser ? 12 : 11}>
									{t('noHealthRecords')}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

const INITIAL_FILTERS: HealthRecordsFilters = {
	fromDate: null,
	toDate: null,
	type: '',
	createdBy: '',
}
