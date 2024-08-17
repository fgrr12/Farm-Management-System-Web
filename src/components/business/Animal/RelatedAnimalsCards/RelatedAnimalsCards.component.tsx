import { AppRoutes } from '@/config/constants/routes'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'

import type { RelatedAnimalsCardsProps } from './RelatedAnimalsCards.types'

import * as S from './RelatedAnimalsCards.styles'

export const RelatedAnimalsCards: FC<RelatedAnimalsCardsProps> = ({
	title,
	animals,
	haveUser,
	type,
	removeRelation,
}) => {
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const params = useParams()
	const navigate = useNavigate()
	const { t } = useTranslation(['animalRelations'])

	const handleAddRelatedAnimals = () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.RELATED_ANIMALS.replace(':animalUuid', animalUuid)
		navigate(path)
	}

	const handleViewRelatedAnimal = (animalUuid: string) => () => {
		const path = AppRoutes.ANIMAL.replace(':animalUuid', animalUuid)
		navigate(path)
	}

	const handleDeleteRelatedAnimal = (animalUuid: string) => async () => {
		setModalData({
			open: true,
			title: t('modal.deleteRelatedAnimal.title'),
			message: t('modal.deleteRelatedAnimal.message'),
			onAccept: async () => {
				setLoading(true)
				await RelatedAnimalsService.deleteRelatedAnimal(animalUuid)
				animals = animals.filter((animal) => animal.uuid !== animalUuid)
				removeRelation(animalUuid)
				setModalData(defaultModalData)
				setLoading(false)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}

	return (
		<S.CardsContainer>
			<S.CenterTitle>
				<S.Label>{title}</S.Label>
				{haveUser && (
					<ActionButton
						title={title.startsWith('Parents') ? t('addParent') : t('addChild')}
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddRelatedAnimals}
					/>
				)}
			</S.CenterTitle>
			{animals.map((animal) => (
				<S.Card key={animal.uuid}>
					<S.CardContent>
						<div>
							<S.CardLabel>{t('animalId')}</S.CardLabel>
							<S.CardValue>{animal[type].animalId}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>{t('breed')}</S.CardLabel>
							<S.CardValue>{animal[type].breed}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>{t('relation')}</S.CardLabel>
							<S.CardValue>{animal[type].relation}</S.CardValue>
						</div>
					</S.CardContent>
					{haveUser && (
						<S.CardActions>
							<ActionButton
								title="View"
								icon="i-material-symbols-visibility"
								onClick={handleViewRelatedAnimal(animal[type].animalUuid)}
							/>
							<ActionButton
								title="Delete"
								icon="i-material-symbols-delete"
								onClick={handleDeleteRelatedAnimal(animal.uuid)}
							/>
						</S.CardActions>
					)}
				</S.Card>
			))}
			{animals.length === 0 && (
				<S.Card>
					<S.CardTitle>{t('noRelatedAnimals')}</S.CardTitle>
				</S.Card>
			)}
		</S.CardsContainer>
	)
}
