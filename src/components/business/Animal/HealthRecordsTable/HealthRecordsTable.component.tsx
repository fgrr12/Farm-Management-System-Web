import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { HealthRecordsService } from '@/services/healthRecords'
import { useAppStore } from '@/store/useAppStore'

import type { HealthRecordsTableProps } from './HealthRecordsTable.types'

import * as S from './HealthRecordsTable.styles'

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
	return (
		<S.TableContainer>
			<S.CenterTitle>
				<S.Label>{t('title')}</S.Label>
				{haveUser && (
					<ActionButton
						title="Add Health Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</S.CenterTitle>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>{t('reason')}</Table.HeadCell>
						<Table.HeadCell>{t('notes')}</Table.HeadCell>
						<Table.HeadCell>{t('type')}</Table.HeadCell>
						<Table.HeadCell>{t('reviewedBy')}</Table.HeadCell>
						<Table.HeadCell>{t('date')}</Table.HeadCell>
						<Table.HeadCell>{t('weight')}</Table.HeadCell>
						<Table.HeadCell>{t('temperature')}</Table.HeadCell>
						<Table.HeadCell>{t('medication')}</Table.HeadCell>
						<Table.HeadCell>{t('dosage')}</Table.HeadCell>
						<Table.HeadCell>{t('frequency')}</Table.HeadCell>
						<Table.HeadCell>{t('duration')}</Table.HeadCell>
						{haveUser && <Table.HeadCell>{t('actions')}</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{healthRecords.map((healthRecord) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell>{healthRecord.reason}</Table.Cell>
							<Table.Cell>{healthRecord.notes}</Table.Cell>
							<Table.Cell>{t(`healthRecordType.${healthRecord.type.toLowerCase()}`)}</Table.Cell>
							<Table.Cell>{healthRecord.reviewedBy}</Table.Cell>
							<Table.Cell>{dayjs(healthRecord.date).format('DD/MM/YYYY')}</Table.Cell>
							<Table.Cell>
								{healthRecord.weight}
								{farm!.weightUnit}
							</Table.Cell>
							<Table.Cell>
								{healthRecord.temperature}
								{farm!.temperatureUnit}
							</Table.Cell>
							<Table.Cell>{healthRecord.medication}</Table.Cell>
							<Table.Cell>{healthRecord.dosage}</Table.Cell>
							<Table.Cell>{healthRecord.frequency}</Table.Cell>
							<Table.Cell>{healthRecord.duration}</Table.Cell>
							{haveUser && (
								<Table.Cell>
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
								</Table.Cell>
							)}
						</Table.Row>
					))}
					{healthRecords.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={haveUser ? 12 : 11}>{t('noHealthRecords')}</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
