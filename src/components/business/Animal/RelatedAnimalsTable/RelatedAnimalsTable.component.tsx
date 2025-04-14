import { AppRoutes } from '@/config/constants/routes'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'

import type { RelatedAnimalsTableProps } from './RelatedAnimalsTable.types'

import * as S from './RelatedAnimalsTable.styles'

export const RelatedAnimalsTable: FC<RelatedAnimalsTableProps> = ({
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
		<S.TableContainer>
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
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>{t('animalId')}</Table.HeadCell>
						<Table.HeadCell>{t('breed')}</Table.HeadCell>
						<Table.HeadCell>{t('relation')}</Table.HeadCell>
						{haveUser && <Table.HeadCell>{t('actions')}</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{animals?.map((animal) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell>{animal[type].animalId}</Table.Cell>
							<Table.Cell>{animal[type].breed.name}</Table.Cell>
							<Table.Cell>{t(animal[type].relation.toLowerCase())}</Table.Cell>
							{haveUser && (
								<Table.Cell>
									<ActionButton
										title="View"
										icon="i-material-symbols-visibility-outline"
										onClick={handleViewRelatedAnimal(animal[type].animalUuid)}
									/>
									<ActionButton
										title="Delete"
										icon="i-material-symbols-delete-outline"
										onClick={handleDeleteRelatedAnimal(animal.uuid)}
									/>
								</Table.Cell>
							)}
						</Table.Row>
					))}
					{animals.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={haveUser ? 12 : 11}>{t('noRelatedAnimals')}</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
