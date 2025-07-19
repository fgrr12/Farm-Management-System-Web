import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import { RelatedAnimalsService } from '@/services/relatedAnimals'

import { ActionButton } from '@/components/ui/ActionButton'

import type { RelatedAnimalsTableProps } from './RelatedAnimalsTable.types'

export const RelatedAnimalsTable: FC<RelatedAnimalsTableProps> = ({
	title,
	animals,
	haveUser,
	type,
	removeRelation,
}) => {
	const { defaultModalData, setModalData, setLoading, setToastData } = useAppStore()
	const { breeds } = useFarmStore()
	const params = useParams()
	const navigate = useNavigate()
	const { t } = useTranslation(['animalRelations'])

	const breed = (breedUuid: string) => breeds.find((breed) => breed.uuid === breedUuid)?.name

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
				try {
					setLoading(true)
					await RelatedAnimalsService.deleteRelatedAnimal(animalUuid)
					animals = animals.filter((animal) => animal.uuid !== animalUuid)
					removeRelation(animalUuid)
					setModalData(defaultModalData)
					setLoading(false)
					setToastData({
						message: t('toast.deleted'),
						type: 'success',
					})
				} catch (_error) {
					setToastData({
						message: t('toast.deleteError'),
						type: 'error',
					})
				}
			},
			onCancel: () => {
				setModalData(defaultModalData)
				setToastData({
					message: t('toast.notDeleted'),
					type: 'info',
				})
			},
		})
	}

	return (
		<div className="w-full xl:w-auto">
			<div className="flex justify-center items-center">
				<div className="font-bold">{title}</div>
				{haveUser && (
					<ActionButton
						title={title.startsWith('Parents') ? t('addParent') : t('addChild')}
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddRelatedAnimals}
					/>
				)}
			</div>
			<div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
				<table className="table table-zebra" aria-label="Related animals">
					<thead>
						<tr>
							<th>{t('animalId')}</th>
							<th>{t('breed')}</th>
							<th>{t('relation')}</th>
							{haveUser && <th>{t('actions')}</th>}
						</tr>
					</thead>
					<tbody>
						{animals?.map((animal) => (
							<tr key={animal.uuid}>
								<td>{animal[type].animalId}</td>
								<td>
									{breed(animal[type].breed) ? breed(animal[type].breed) : animal[type].breed}
								</td>
								<td>{t(animal[type].relation.toLowerCase())}</td>
								{haveUser && (
									<td>
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
									</td>
								)}
							</tr>
						))}
						{animals.length === 0 && (
							<tr>
								<td className="text-center font-bold" colSpan={haveUser ? 4 : 3}>
									{t('noRelatedAnimals')}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
