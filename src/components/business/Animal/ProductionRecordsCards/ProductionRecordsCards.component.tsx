import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { ProductionRecordsService } from '@/services/productionRecords'
import { useFarmStore } from '@/store/useFarmStore'

import type { ProductionRecordsCardsProps } from './ProductionRecordsCards.types'

import * as S from './ProductionRecordsCards.styles'

export const ProductionRecordsCards: FC<ProductionRecordsCardsProps> = ({
	productionRecords,
	user,
	removeProductionRecord,
}) => {
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()

	const handleAddHealthRecord = () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.ADD_PRODUCTION_RECORD.replace(':animalUuid', animalUuid)
		navigate(path)
	}

	const handleEditHealthRecord = (uuid: string) => () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.EDIT_PRODUCTION_RECORD.replace(':animalUuid', animalUuid).replace(
			':productionRecordUuid',
			uuid
		)
		navigate(path)
	}

	const handleDeleteHealthRecord = (uuid: string) => async () => {
		await ProductionRecordsService.updateProductionRecordsStatus(uuid, false)
		removeProductionRecord(uuid)
	}
	return (
		<S.CardsContainer>
			<S.CenterTitle>
				<S.Label>Production Records</S.Label>
				{user && (
					<ActionButton
						title="Add Production Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</S.CenterTitle>
			{productionRecords.map((productionRecord) => (
				<S.Card key={productionRecord.uuid}>
					<S.CardTitle>{dayjs(productionRecord.date).format('DD/MM/YYYY')}</S.CardTitle>
					<S.CardContent>
						<div>
							<S.CardLabel>Quantity</S.CardLabel>
							<S.CardValue>
								{productionRecord.quantity}
								{farm?.liquidUnit}
							</S.CardValue>
						</div>
						<div>
							<S.CardLabel>Notes</S.CardLabel>
							<S.CardValue>{productionRecord.notes}</S.CardValue>
						</div>
					</S.CardContent>
					{user && (
						<S.CardActions>
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit"
								onClick={handleEditHealthRecord(productionRecord.uuid)}
							/>
							<ActionButton
								title="Delete"
								icon="i-material-symbols-delete"
								onClick={handleDeleteHealthRecord(productionRecord.uuid)}
							/>
						</S.CardActions>
					)}
				</S.Card>
			))}
			{productionRecords.length === 0 && (
				<S.Card>
					<S.CardTitle>No production records</S.CardTitle>
				</S.Card>
			)}
		</S.CardsContainer>
	)
}
