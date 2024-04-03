import dayjs from 'dayjs'

// Components
import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

// Types
import type { HealthRecordsTableProps } from './HealthRecordsTable.types'

// Styles
import * as S from './HealthRecordsTable.styles'

export const HealthRecordsTable: FC<HealthRecordsTableProps> = ({ healthRecords, user }) => {
	return (
		<S.TableContainer>
			<S.CenterTitle>
				<S.Label>Health Records</S.Label>
				{user && (
					<ActionButton title="Add Health Record" icon="i-material-symbols-add-circle-outline" />
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
									<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
									<ActionButton title="Delete" icon="i-material-symbols-delete-outline" />
								</Table.Cell>
							)}
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
