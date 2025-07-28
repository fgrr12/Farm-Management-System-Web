import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'

import type { CardProps } from './RelatedAnimalCard.types'

export const RelatedAnimalCard: FC<CardProps> = ({ animal, ...props }) => {
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
	}, [dragging, animal])
	return (
		<div
			className={`bg-white rounded-lg border border-gray-200 p-4 cursor-grab transition-all duration-200 hover:shadow-md ${
				dragging ? 'shadow-lg scale-105 bg-blue-50 border-blue-300' : 'hover:border-gray-300'
			}`}
			ref={ref}
			role="button"
			tabIndex={0}
			aria-label={`Animal ${animal.animalId}, ${animal.breed}, ${animal.gender}`}
			{...props}
		>
			<div className="flex items-center gap-4">
				{/* Animal Avatar */}
				<div className="relative flex-shrink-0">
					<div className="w-18 h-18 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
						<img
							className="w-full h-full object-cover pointer-events-none"
							src={animal.picture || '/assets/default-imgs/cow.svg'}
							alt={`Animal ${animal.animalId}`}
						/>
					</div>
					{/* Gender indicator */}
					<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
						{animal.gender.toLowerCase() === 'male' ? (
							<i className="i-material-symbols-male bg-blue-500! w-6! h-6!" />
						) : (
							<i className="i-material-symbols-female bg-pink-500! w-6! h-6!" />
						)}
					</div>
				</div>

				{/* Animal Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<span className="font-bold text-gray-900 text-xl">#{animal.animalId}</span>
						{dragging && (
							<i className="i-material-symbols-drag-indicator w-5! h-5! text-gray-400" />
						)}
					</div>
					<p className="text-gray-600 font-medium">{animal.breed}</p>
				</div>

				{/* Drag Handle */}
				<div className="flex-shrink-0 opacity-40 hover:opacity-60 transition-opacity">
					<i className="i-material-symbols-drag-handle w-5! h-5! text-gray-400" />
				</div>
			</div>
		</div>
	)
}
