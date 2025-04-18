import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CardProps } from './RelatedAnimalCard.types'

export const RelatedAnimalCard: FC<CardProps> = ({ animal, ...props }) => {
	const { t } = useTranslation(['relatedAnimalCard'])
	const ref: any = useRef(null)
	const [dragging, setDragging] = useState<boolean>(false)

	useEffect(() => {
		const el = ref.current
		if (!el) {
			throw new Error('Expected "el" to be defined')
		}

		return draggable({
			element: el,
			getInitialData: () => ({ dragging, location: animal.location, pieceType: animal.uuid }),
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		})
	}, [dragging, animal.location, animal.uuid])
	return (
		<div
			className={`card bg-base-100 w-full h-auto shadow-sm ${dragging && 'bg-warning'}`}
			ref={ref}
			{...props}
		>
			<div className="card-body">
				<div className="flex justify-between">
					<div className="flex items-center">
						<div className="avatar">
							<div className="w-12 rounded-full bg-primary-100 shadow-lg">
								<img
									className="pointer-events-none"
									src={animal.picture || '/assets/default-imgs/cow.svg'}
									alt="Animal"
								/>
							</div>
						</div>
						<div className="ml-4">
							<h2 className="card-title">
								<span className="text-gray-700">
									{t('animalId')}: {animal.animalId}
								</span>
							</h2>
							<p className="card-subtitle text-gray-600">
								{t('breed')}: {animal.breed.name}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
