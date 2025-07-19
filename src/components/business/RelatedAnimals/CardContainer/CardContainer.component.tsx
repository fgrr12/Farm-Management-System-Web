import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RelatedAnimalCard } from '../RelatedAnimalCard'
import type { ContainerProps } from './CardContainer.types'

export const CardContainer: FC<ContainerProps> = ({ title, location, animals, ...props }) => {
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
		<div
			className={`w-auto h-full p-4 rounded-lg shadow-lg flex flex-col ${isDraggedOver ? 'bg-info' : ''}`}
			ref={ref}
			{...props}
		>
			<div className="flex items-center justify-between mb-4">
				<span className="text-md font-semibold text-xl">{title}</span>
				<label className="input p-2 w-[60%] rounded-md">
					<i className="i-ph-magnifying-glass-duotone h-6! w-6! opacity-50" />
					<input
						type="search"
						className="grow"
						autoComplete="off"
						placeholder={t('filterByID')}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						aria-label={t('filterByID')}
					/>
				</label>
			</div>

			<div className="flex flex-col gap-2 overflow-auto pb-4">
				{filteredAnimals.map((animal) => (
					<RelatedAnimalCard key={animal.animalId} animal={animal} draggable />
				))}
			</div>
		</div>
	)
}
