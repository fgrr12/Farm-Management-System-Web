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
			className={`card bg-base-100 w-full h-auto shadow-sm cursor-grab ${dragging && 'bg-warning'}`}
			ref={ref}
			{...props}
		>
			<div className="card-body">
				<div className="flex justify-between">
					<div className="flex items-center">
						<div className="avatar">
							<div className="w-14 h-14 rounded-full bg-primary-100 shadow-lg">
								<img
									className="pointer-events-none"
									src={animal.picture || '/assets/default-imgs/cow.svg'}
									alt="Animal"
								/>
							</div>
						</div>
						<div className="ml-4 user-select-none">
							<h2 className="card-title">
								<span className="text-2xl">{animal.animalId}</span>
							</h2>
							<p className="card-subtitle text-lg user-select-none">
								{animal.breed.name}
								{animal.gender.toLowerCase() === 'male' ? (
									<i className="i-tdesign-gender-male bg-blue-500! w-5! h-5!" />
								) : (
									<i className="i-tdesign-gender-female bg-pink-500! w-5! h-5!" />
								)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
