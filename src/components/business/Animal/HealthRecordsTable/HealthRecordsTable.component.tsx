import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'

import { HealthRecordsService } from '@/services/healthRecords'

import { ActionButton } from '@/components/ui/ActionButton'

import type { HealthRecord, HealthRecordsTableProps } from './HealthRecordsTable.types'

export const HealthRecordsTable: FC<HealthRecordsTableProps> = ({
	healthRecords,
	haveUser,
	farm,
	removeHealthRecord,
}) => {
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalHealthRecords'])

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
				setLoading(true)
				await HealthRecordsService.updateHealthRecordsStatus(uuid, false)
				removeHealthRecord(uuid)
				setModalData(defaultModalData)
				setLoading(false)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}

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

	return (
		<div className="w-full xl:w-auto">
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
						{healthRecords.map((healthRecord) => (
							<tr key={self.crypto.randomUUID()} className={trBgColor(healthRecord.type)}>
								<td className="text-black">{healthRecord.reason}</td>
								<td className="text-black flex flex-col gap-1">
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
						{healthRecords.length === 0 && (
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
