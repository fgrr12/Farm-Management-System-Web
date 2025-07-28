import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RelatedAnimalCard } from '../RelatedAnimalCard'
import type { ContainerProps } from './CardContainer.types'

export const CardContainer: FC<ContainerProps> = ({
	title,
	location,
	animals,
	icon,
	iconColor,
	...props
}) => {
	const { t } = useTranslation(['relatedAnimals'])
	const ref: any = useRef(null)
	const [isDraggedOver, setIsDraggedOver] = useState(false)
	const [search, setSearch] = useState('')

	const { filteredAnimals } = useMemo(() => {
		if (!animals.length) return { filteredAnimals: [] }
		return {
			filteredAnimals: search
				? animals.filter((animal) => animal.animalId.toLowerCase().includes(search.toLowerCase()))
				: animals,
		}
	}, [animals, search])

	useEffect(() => {
		const el = ref.current
		if (!el) {
			throw new Error('Expected "el" to be defined')
		}

		return dropTargetForElements({
			element: el,
			getData: () => ({ location }),
			onDragEnter: () => setIsDraggedOver(true),
			onDragLeave: () => setIsDraggedOver(false),
			onDrop: () => setIsDraggedOver(false),
		})
	}, [location])

	return (
		<section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 min-h-[400px]" {...props}>
			{/* Section Header */}
			<div className="flex items-center gap-2 mb-4">
				<i className={`${icon} ${iconColor} w-5! h-5!`} />
				<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
			</div>

			{/* Card Container Content */}
			<div className="flex flex-col h-full">
				{/* Search Bar */}
				<div className="mb-4">
					<div className="relative">
						<i className="i-material-symbols-search absolute left-3 top-1/2 transform -translate-y-1/2 w-5! h-5! text-gray-400" />
						<input
							type="search"
							className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							autoComplete="off"
							placeholder={t('filterByID')}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							aria-label={t('filterByID')}
						/>
					</div>
				</div>

				{/* Animals List Container with Drop Zone */}
				<div className="flex-1 relative overflow-hidden" ref={ref}>
					<div className="h-full overflow-y-auto space-y-3">
						{filteredAnimals.length > 0 ? (
							filteredAnimals.map((animal) => (
								<RelatedAnimalCard key={animal.animalId} animal={animal} draggable />
							))
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-gray-500">
								<i className="i-material-symbols-pets w-12! h-12! mb-2 opacity-50" />
								<p className="text-sm text-center">
									{search ? t('noAnimalsFound') : t('noAnimalsAvailable')}
								</p>
							</div>
						)}
					</div>

					{/* Drop Zone Indicator - Only covers the animals list area */}
					{isDraggedOver && (
						<div className="absolute bottom-12 inset-0 flex items-center justify-center bg-blue-100/90 rounded-lg border-2 border-blue-400 border-dashed z-20">
							<div className="text-center">
								<i className="i-material-symbols-move-down w-8! h-8! text-blue-600 mb-2" />
								<p className="text-blue-600 font-medium">{t('dropHere')}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
