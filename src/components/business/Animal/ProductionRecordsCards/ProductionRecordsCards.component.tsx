import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { ProductionRecordsService } from '@/services/productionRecords'
import { useAppStore } from '@/store/useAppStore'

import type { ProductionRecordsCardsProps } from './ProductionRecordsCards.types'

import * as S from './ProductionRecordsCards.styles'

export const ProductionRecordsCards: FC<ProductionRecordsCardsProps> = ({
	productionRecords,
	haveUser,
	farm,
	removeProductionRecord,
}) => {
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalProductionRecords'])

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
		setModalData({
			open: true,
			title: t('modal.deleteProductionRecord.title'),
			message: t('modal.deleteProductionRecord.message'),
			onAccept: async () => {
				setLoading(true)
				await ProductionRecordsService.updateProductionRecordsStatus(uuid, false)
				removeProductionRecord(uuid)
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
							<S.CardLabel>{t('quantity')}</S.CardLabel>
							<S.CardValue>
								{productionRecord.quantity}
								{farm?.liquidUnit}
							</S.CardValue>
						</div>
						<div>
							<S.CardLabel>{t('notes')}</S.CardLabel>
							<S.CardValue>{productionRecord.notes}</S.CardValue>
						</div>
					</S.CardContent>
					{haveUser && (
						<S.CardActions>
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit"
								onClick={handleEditHealthRecord(productionRecord.uuid)}
							/>
							<ActionButton
								title="Delete"
								icon="i-material-symbols-delete-outline"
								onClick={handleDeleteHealthRecord(productionRecord.uuid)}
							/>
						</S.CardActions>
					)}
				</S.Card>
			))}
			{productionRecords.length === 0 && (
				<S.Card>
					<S.CardTitle>{t('noProductionRecords')}</S.CardTitle>
				</S.Card>
			)}
		</S.CardsContainer>
	)
}
