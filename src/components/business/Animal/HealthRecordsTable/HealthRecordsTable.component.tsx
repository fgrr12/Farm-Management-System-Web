import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useLocation, useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { HealthRecordsService } from '@/services/healthRecords'

import type { HealthRecordsTableProps } from './HealthRecordsTable.types'

import * as S from './HealthRecordsTable.styles'

export const HealthRecordsTable: FC<HealthRecordsTableProps> = ({
	healthRecords,
	user,
	removeHealthRecord,
}) => {
	const location = useLocation()
	const navigate = useNavigate()

	const handleAddHealthRecord = () => {
		const animalUuid = location.pathname.split('/').pop()
		const path = AppRoutes.ADD_HEALTH_RECORD.replace(':animalUuid', animalUuid || '')
		navigate(path)
	}

	const handleEditHealthRecord = (uuid: string) => () => {
		const animalUuid = location.pathname.split('/').pop()
		const path = AppRoutes.EDIT_HEALTH_RECORD.replace(':animalUuid', animalUuid || '').replace(
			':healthRecordUuid',
			uuid
		)
		navigate(path)
	}

	const handleDeleteHealthRecord = (uuid: string) => async () => {
		await HealthRecordsService.updateHealthRecordsStatus(uuid, false)
		removeHealthRecord(uuid)
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
							<Table.Cell data-title="Reason">{healthRecord.reason}</Table.Cell>
							<Table.Cell data-title="Notes">{healthRecord.notes}</Table.Cell>
							<Table.Cell data-title="Type">{healthRecord.type}</Table.Cell>
							<Table.Cell data-title="Reviewed By">{healthRecord.reviewedBy}</Table.Cell>
							<Table.Cell data-title="Date">
								{dayjs(healthRecord.date).format('MM/DD/YYYY')}
							</Table.Cell>
							<Table.Cell data-title="Weight">{healthRecord.weight}</Table.Cell>
							<Table.Cell data-title="Temperature">{healthRecord.temperature}</Table.Cell>
							<Table.Cell data-title="Medication">{healthRecord.medication}</Table.Cell>
							<Table.Cell data-title="Dosage">{healthRecord.dosage}</Table.Cell>
							<Table.Cell data-title="Frequency">{healthRecord.frequency}</Table.Cell>
							<Table.Cell data-title="Duration">{healthRecord.duration}</Table.Cell>
							{user && (
								<Table.Cell data-title="Actions">
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
