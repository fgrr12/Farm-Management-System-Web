import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { HealthRecordsService } from '@/services/healthRecords'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import type { HealthRecordsTableProps } from './HealthRecordsTable.types'

import * as S from './HealthRecordsTable.styles'

export const HealthRecordsTable: FC<HealthRecordsTableProps> = ({
	healthRecords,
	user,
	removeHealthRecord,
}) => {
	const { farm } = useFarmStore()
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const params = useParams()

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
			title: 'Do you want to delete this health record?',
			message: 'This action cannot be undone.',
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
				<S.Label>Health Records</S.Label>
				{user && (
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
						<Table.HeadCell>Reason</Table.HeadCell>
						<Table.HeadCell>Notes</Table.HeadCell>
						<Table.HeadCell>Type</Table.HeadCell>
						<Table.HeadCell>Reviewed By</Table.HeadCell>
						<Table.HeadCell>Date</Table.HeadCell>
						<Table.HeadCell>Weight</Table.HeadCell>
						<Table.HeadCell>Temperature</Table.HeadCell>
						<Table.HeadCell>Medication</Table.HeadCell>
						<Table.HeadCell>Dosage</Table.HeadCell>
						<Table.HeadCell>Frequency</Table.HeadCell>
						<Table.HeadCell>Duration</Table.HeadCell>
						{user && <Table.HeadCell>Actions</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{healthRecords.map((healthRecord) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell>{healthRecord.reason}</Table.Cell>
							<Table.Cell>{healthRecord.notes}</Table.Cell>
							<Table.Cell>{healthRecord.type}</Table.Cell>
							<Table.Cell>{healthRecord.reviewedBy}</Table.Cell>
							<Table.Cell>{dayjs(healthRecord.date).format('MM/DD/YYYY')}</Table.Cell>
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
							{user && (
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
							<Table.Cell colSpan={user ? 12 : 11}>No health records found</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
