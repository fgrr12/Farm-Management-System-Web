import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

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
	const { user } = useUserStore()
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
					await RelatedAnimalsService.deleteRelatedAnimal(animalUuid, user!.uuid)
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
							type === 'parent' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
						}`}
					>
						<i
							className={`w-5 h-5 ${
								type === 'parent'
									? 'i-material-symbols-family-restroom text-blue-600 dark:text-blue-300'
									: 'i-material-symbols-child-care text-green-600 dark:text-green-300'
							}`}
						/>
					</div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
					<span
						className={`px-2 py-1 text-xs font-medium rounded-full ${
							type === 'parent'
								? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
								: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
						aria-label="Related animals"
					>
						<thead className="bg-gray-50 dark:bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('animalId')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('breed')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('relation')}
								</th>
								{haveUser && (
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										{t('actions')}
									</th>
								)}
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{animals?.map((animal, index) => (
								<tr
									key={animal.uuid}
									className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">
										<div className="flex items-center gap-3">
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
													type === 'parent'
														? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
														: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
												}`}
											>
												<i
													className={`w-4 h-4 ${type === 'parent' ? 'i-material-symbols-family-restroom' : 'i-material-symbols-child-care'}`}
												/>
											</div>
											<span className="font-semibold">{animal[type].animalId}</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
										<div className="flex items-center gap-2">
											<i className="i-material-symbols-pets w-4 h-4 text-gray-400 dark:text-gray-500" />
											<span>
												{breed(animal[type].breed) ? breed(animal[type].breed) : animal[type].breed}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												animal[type].relation.toLowerCase() === 'father'
													? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border dark:border-blue-700'
													: animal[type].relation.toLowerCase() === 'mother'
														? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 dark:border dark:border-pink-700'
														: animal[type].relation.toLowerCase() === 'son'
															? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dark:border dark:border-green-700'
															: animal[type].relation.toLowerCase() === 'daughter'
																? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 dark:border dark:border-purple-700'
																: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border dark:border-gray-600'
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
									<td
										className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
										colSpan={haveUser ? 4 : 3}
									>
										<div className="flex flex-col items-center gap-3">
											<div
												className={`w-16 h-16 rounded-full flex items-center justify-center ${
													type === 'parent'
														? 'bg-blue-50 dark:bg-blue-900/30'
														: 'bg-green-50 dark:bg-green-900/30'
												}`}
											>
												<i
													className={`w-8 h-8 text-gray-300 dark:text-gray-600 ${
														type === 'parent'
															? 'i-material-symbols-family-restroom'
															: 'i-material-symbols-child-care'
													}`}
												/>
											</div>
											<div className="text-center">
												<span className="font-medium text-gray-900 dark:text-gray-100">
													{t('noRelatedAnimals')}
												</span>
												<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
