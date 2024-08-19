import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { HealthRecordsService } from '@/services/healthRecords'
import { useAppStore } from '@/store/useAppStore'

import type { HealthRecordsCardsProps } from './HealthRecordsCards.types'

import * as S from './HealthRecordsCards.styles'

export const HealthRecordsCards: FC<HealthRecordsCardsProps> = ({
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
		<S.CardsContainer>
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
			<S.CardContainer>
				{healthRecords.map((healthRecord) => (
					<S.Card key={healthRecord.uuid}>
						<S.CardTitle>{healthRecord.reason}</S.CardTitle>
						<S.CardContent>
							<div>
								<S.CardLabel>{t('notes')}</S.CardLabel>
								<S.CardValue>{healthRecord.notes}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>{t('date')}</S.CardLabel>
								<S.CardValue>{dayjs(healthRecord.date).format('DD/MM/YYYY')}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>{t('reviewedBy')}</S.CardLabel>
								<S.CardValue>{healthRecord.reviewedBy}</S.CardValue>
							</div>
							<div>
								<S.CardLabel>{t('type')}</S.CardLabel>
								<S.CardValue>{healthRecord.type}</S.CardValue>
							</div>
							{healthRecord.weight !== 0 && (
								<div>
									<S.CardLabel>{t('weight')}</S.CardLabel>
									<S.CardValue>
										{healthRecord.weight}
										{farm?.weightUnit}
									</S.CardValue>
								</div>
							)}
							{healthRecord.temperature !== 0 && (
								<div>
									<S.CardLabel>{t('temperature')}</S.CardLabel>
									<S.CardValue>
										{healthRecord.temperature}
										{farm?.temperatureUnit}
									</S.CardValue>
								</div>
							)}
							{healthRecord.medication && (
								<div>
									<S.CardLabel>{t('medication')}</S.CardLabel>
									<S.CardValue>{healthRecord.medication}</S.CardValue>
								</div>
							)}
							{healthRecord.dosage && (
								<div>
									<S.CardLabel>{t('dosage')}</S.CardLabel>
									<S.CardValue>{healthRecord.dosage}</S.CardValue>
								</div>
							)}
							{healthRecord.frequency && (
								<div>
									<S.CardLabel>{t('frequency')}</S.CardLabel>
									<S.CardValue>{healthRecord.frequency}</S.CardValue>
								</div>
							)}
							{healthRecord.duration && (
								<div>
									<S.CardLabel>{t('duration')}</S.CardLabel>
									<S.CardValue>{healthRecord.duration}</S.CardValue>
								</div>
							)}
						</S.CardContent>
						{haveUser && (
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
						<S.CardTitle>{t('noHealthRecords')}</S.CardTitle>
					</S.Card>
				)}
			</S.CardContainer>
		</S.CardsContainer>
	)
}
