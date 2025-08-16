import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import { HealthRecordsService } from '@/services/healthRecords'

import { ActionButton } from '@/components/ui/ActionButton'

import { HealthRecordsFilters } from '../HealthRecordsFilters'
import type {
	HealthRecordsFilters as HealthRecordsFiltersType,
	HealthRecordsTableProps,
} from './HealthRecordsTable.types'

const trBgColor = (reason: HealthRecordType) => {
	switch (reason) {
		case 'Checkup':
			return 'bg-sky-100 dark:bg-sky-900/20'
		case 'Vaccination':
			return 'bg-emerald-100 dark:bg-emerald-900/20'
		case 'Medication':
			return 'bg-teal-100 dark:bg-teal-900/20'
		case 'Surgery':
			return 'bg-indigo-100 dark:bg-indigo-900/20'
		case 'Pregnancy':
			return 'bg-rose-200 dark:bg-rose-900/30'
		case 'Deworming':
			return 'bg-pink-100 dark:bg-pink-900/20'
		case 'Birth':
			return 'bg-yellow-100 dark:bg-yellow-900/20'
		case 'Drying':
			return 'bg-orange-100 dark:bg-orange-900/20'
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

	const [filters, setFilters] = useState<HealthRecordsFiltersType>(INITIAL_FILTERS)

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

	const handleFiltersChange = (newFilters: HealthRecordsFiltersType) => {
		setFilters(newFilters)
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
					await HealthRecordsService.updateHealthRecordsStatus(uuid, user!.uuid)
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
		<div className="w-full">
			{/* Header with Filters and Add Button */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
					{user && (
						<div className="flex-shrink-0">
							<HealthRecordsFilters
								filters={filters}
								onFiltersChange={handleFiltersChange}
								employees={employees}
								userRole={user.role}
							/>
						</div>
					)}
				</div>

				<div className="flex-shrink-0">
					{haveUser && (
						<ActionButton
							title="Add Health Record"
							icon="i-material-symbols-add-circle-outline"
							onClick={handleAddHealthRecord}
						/>
					)}
				</div>
			</div>
			{/* Modern Table Design */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
						aria-label="Health records"
					>
						<thead className="bg-gray-50 dark:bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('reason')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('notes')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('type')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('reviewedBy')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('date')}
								</th>
								{haveUser && (
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										{t('actions')}
									</th>
								)}
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{healthRecordsFiltered.map((healthRecord) => (
								<tr
									key={healthRecord.uuid}
									className={`${trBgColor(healthRecord.type)} hover:bg-opacity-80 transition-colors`}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										{healthRecord.reason}
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
										<div className="space-y-2">
											<div className="font-medium">{healthRecord.notes}</div>
											{additionalInfoExists(healthRecord) && (
												<div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
													<div className="font-medium text-gray-700 dark:text-gray-200">
														{t('additionalInfo')}:
													</div>
													{healthRecord.weight! > 0 && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-monitor-weight w-3 h-3" />
															<span>
																{t('weight')}: {healthRecord.weight} {farm!.weightUnit}
															</span>
														</div>
													)}
													{healthRecord.temperature! > 0 && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-device-thermostat w-3 h-3" />
															<span>
																{t('temperature')}: {healthRecord.temperature}{' '}
																{farm!.temperatureUnit}
															</span>
														</div>
													)}
													{healthRecord.medication && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-medication w-3 h-3" />
															<span>
																{t('medication')}: {healthRecord.medication}
															</span>
														</div>
													)}
													{healthRecord.dosage && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-syringe w-3 h-3" />
															<span>
																{t('dosage')}: {healthRecord.dosage}
															</span>
														</div>
													)}
													{healthRecord.frequency && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-schedule w-3 h-3" />
															<span>
																{t('frequency')}: {healthRecord.frequency}
															</span>
														</div>
													)}
													{healthRecord.duration && (
														<div className="flex items-center gap-1">
															<i className="i-material-symbols-timer w-3 h-3" />
															<span>
																{t('duration')}: {healthRecord.duration}
															</span>
														</div>
													)}
												</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												healthRecord.type === 'Checkup'
													? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 dark:border dark:border-sky-700'
													: healthRecord.type === 'Vaccination'
														? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 dark:border dark:border-emerald-700'
														: healthRecord.type === 'Medication'
															? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 dark:border dark:border-teal-700'
															: healthRecord.type === 'Surgery'
																? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 dark:border dark:border-indigo-700'
																: healthRecord.type === 'Pregnancy'
																	? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 dark:border dark:border-rose-700'
																	: healthRecord.type === 'Deworming'
																		? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 dark:border dark:border-pink-700'
																		: healthRecord.type === 'Birth'
																			? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dark:border dark:border-yellow-700'
																			: healthRecord.type === 'Drying'
																				? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dark:border dark:border-orange-700'
																				: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border dark:border-gray-600'
											}`}
										>
											{t(`healthRecordType.${healthRecord.type.toLowerCase()}`)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
										{healthRecord.reviewedBy}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										{dayjs(healthRecord.date).format('DD/MM/YYYY')}
									</td>
									{haveUser && (
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
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
											</div>
										</td>
									)}
								</tr>
							))}
							{healthRecordsFiltered.length === 0 && (
								<tr>
									<td
										className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
										colSpan={haveUser ? 6 : 5}
									>
										<div className="flex flex-col items-center gap-2">
											<i className="i-material-symbols-health-and-safety w-12 h-12 text-gray-300 dark:text-gray-600" />
											<span className="font-medium">{t('noHealthRecords')}</span>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

const INITIAL_FILTERS: HealthRecordsFiltersType = {
	fromDate: null,
	toDate: null,
	type: '',
	createdBy: '',
}
