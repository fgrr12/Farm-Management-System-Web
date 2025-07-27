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
		<div className="w-full">
			{/* Header with Title and Add Button */}
			<div className="flex items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-3">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							type === 'parent' ? 'bg-blue-100' : 'bg-green-100'
						}`}
					>
						<i
							className={`w-5 h-5 ${
								type === 'parent'
									? 'i-material-symbols-family-restroom text-blue-600'
									: 'i-material-symbols-child-care text-green-600'
							}`}
						/>
					</div>
					<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
					<span
						className={`px-2 py-1 text-xs font-medium rounded-full ${
							type === 'parent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
						}`}
					>
						{animals.length}
					</span>
				</div>
				{haveUser && (
					<ActionButton
						title={title.startsWith('Parents') ? t('addParent') : t('addChild')}
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddRelatedAnimals}
					/>
				)}
			</div>

			{/* Modern Table Design */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200" aria-label="Related animals">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t('animalId')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t('breed')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t('relation')}
								</th>
								{haveUser && (
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t('actions')}
									</th>
								)}
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{animals?.map((animal, index) => (
								<tr
									key={animal.uuid}
									className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										<div className="flex items-center gap-3">
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
													type === 'parent'
														? 'bg-blue-100 text-blue-800'
														: 'bg-green-100 text-green-800'
												}`}
											>
												<i
													className={`w-4 h-4 ${type === 'parent' ? 'i-material-symbols-family-restroom' : 'i-material-symbols-child-care'}`}
												/>
											</div>
											<span className="font-semibold">{animal[type].animalId}</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<div className="flex items-center gap-2">
											<i className="i-material-symbols-pets w-4 h-4 text-gray-400" />
											<span>
												{breed(animal[type].breed) ? breed(animal[type].breed) : animal[type].breed}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												animal[type].relation.toLowerCase() === 'father'
													? 'bg-blue-100 text-blue-800'
													: animal[type].relation.toLowerCase() === 'mother'
														? 'bg-pink-100 text-pink-800'
														: animal[type].relation.toLowerCase() === 'son'
															? 'bg-green-100 text-green-800'
															: animal[type].relation.toLowerCase() === 'daughter'
																? 'bg-purple-100 text-purple-800'
																: 'bg-gray-100 text-gray-800'
											}`}
										>
											<i
												className={`w-3 h-3 mr-1 ${
													animal[type].relation.toLowerCase() === 'father'
														? 'i-material-symbols-man'
														: animal[type].relation.toLowerCase() === 'mother'
															? 'i-material-symbols-woman'
															: animal[type].relation.toLowerCase() === 'son'
																? 'i-material-symbols-boy'
																: animal[type].relation.toLowerCase() === 'daughter'
																	? 'i-material-symbols-girl'
																	: 'i-material-symbols-family-restroom'
												}`}
											/>
											{t(animal[type].relation.toLowerCase())}
										</span>
									</td>
									{haveUser && (
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
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
											</div>
										</td>
									)}
								</tr>
							))}
							{animals.length === 0 && (
								<tr>
									<td className="px-6 py-12 text-center text-gray-500" colSpan={haveUser ? 4 : 3}>
										<div className="flex flex-col items-center gap-3">
											<div
												className={`w-16 h-16 rounded-full flex items-center justify-center ${
													type === 'parent' ? 'bg-blue-50' : 'bg-green-50'
												}`}
											>
												<i
													className={`w-8 h-8 text-gray-300 ${
														type === 'parent'
															? 'i-material-symbols-family-restroom'
															: 'i-material-symbols-child-care'
													}`}
												/>
											</div>
											<div className="text-center">
												<span className="font-medium text-gray-900">{t('noRelatedAnimals')}</span>
												<p className="text-sm text-gray-500 mt-1">
													{type === 'parent' ? t('noParentsMessage') : t('noChildrenMessage')}
												</p>
											</div>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
