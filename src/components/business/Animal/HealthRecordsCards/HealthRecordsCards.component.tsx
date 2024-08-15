import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { HealthRecordsService } from '@/services/healthRecords'
import { useFarmStore } from '@/store/useFarmStore'

import type { HealthRecordsCardsProps } from './HealthRecordsCards.types'

import * as S from './HealthRecordsCards.styles'

export const HealthRecordsCards: FC<HealthRecordsCardsProps> = ({
	healthRecords,
	user,
	removeHealthRecord,
}) => {
	const { farm } = useFarmStore()
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
		await HealthRecordsService.updateHealthRecordsStatus(uuid, false)
		removeHealthRecord(uuid)
	}
	return (
		<S.CardsContainer>
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
			<S.CardContainer>
				{healthRecords.map((healthRecord) => (
					<S.Card key={healthRecord.uuid}>
						<S.CardTitle>{healthRecord.reason}</S.CardTitle>
						<S.CardContent>
							<div>
								<S.CardLabel>Notes</S.CardLabel>
								<S.CardValue>{healthRecord.notes}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>Date</S.CardLabel>
								<S.CardValue>{dayjs(healthRecord.date).format('MM/DD/YYYY')}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>Reviewed By</S.CardLabel>
								<S.CardValue>{healthRecord.reviewedBy}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>Type</S.CardLabel>
								<S.CardValue>{healthRecord.type}</S.CardValue>
							</div>
							{healthRecord.weight !== 0 && (
								<div>
									<S.CardLabel>Weight</S.CardLabel>
									<S.CardValue>
										{healthRecord.weight}
										{farm?.weightUnit}
									</S.CardValue>
								</div>
							)}
							{healthRecord.temperature !== 0 && (
								<div>
									<S.CardLabel>Temperature</S.CardLabel>
									<S.CardValue>
										{healthRecord.temperature}
										°F
									</S.CardValue>
								</div>
							)}
							{healthRecord.medication !== '-' && (
								<div>
									<S.CardLabel>Medication</S.CardLabel>
									<S.CardValue>{healthRecord.medication}</S.CardValue>
								</div>
							)}
							{healthRecord.dosage !== '-' && (
								<div>
									<S.CardLabel>Dosage</S.CardLabel>
									<S.CardValue>{healthRecord.dosage}</S.CardValue>
								</div>
							)}
							{healthRecord.frequency !== '-' && (
								<div>
									<S.CardLabel>Frequency</S.CardLabel>
									<S.CardValue>{healthRecord.frequency}</S.CardValue>
								</div>
							)}
							{healthRecord.duration !== '-' && (
								<div>
									<S.CardLabel>Duration</S.CardLabel>
									<S.CardValue>{healthRecord.duration}</S.CardValue>
								</div>
							)}
						</S.CardContent>
						{user && (
							<S.CardActions>
								<ActionButton
									title="Edit"
									icon="i-material-symbols-edit"
									onClick={handleEditHealthRecord(healthRecord.uuid)}
								/>
								<ActionButton
									title="Delete"
									icon="i-material-symbols-delete"
									onClick={handleDeleteHealthRecord(healthRecord.uuid)}
								/>
							</S.CardActions>
						)}
					</S.Card>
				))}
				{healthRecords.length === 0 && (
					<S.Card>
						<S.CardTitle>No Health Records</S.CardTitle>
					</S.Card>
				)}
			</S.CardContainer>
		</S.CardsContainer>
	)
}
