import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useIsMobile } from '@/hooks/ui/useIsMobile'

import type { CardProps } from './RelatedAnimalCard.types'

export const RelatedAnimalCard: FC<CardProps> = ({ animal, ...props }) => {
	const ref: any = useRef(null)
	const [dragging, setDragging] = useState<boolean>(false)
	const [touchStartTime, setTouchStartTime] = useState(0)
	const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 })
	const isMobile = useIsMobile()

	// Touch handlers for better mobile experience
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (!isMobile) return

			const touch = e.touches[0]
			setTouchStartTime(Date.now())
			setTouchStartPos({ x: touch.clientX, y: touch.clientY })
		},
		[isMobile]
	)

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isMobile) return

			const touch = e.touches[0]
			const deltaX = Math.abs(touch.clientX - touchStartPos.x)
			const deltaY = Math.abs(touch.clientY - touchStartPos.y)
			const timeDiff = Date.now() - touchStartTime

			// If user has moved significantly or held for long enough, allow drag
			if ((deltaX > 15 || deltaY > 15) && timeDiff > 300) {
				// This is likely a drag gesture
				e.preventDefault()
			}
		},
		[isMobile, touchStartPos, touchStartTime]
	)

	useEffect(() => {
		const el = ref.current
		if (!el) {
			throw new Error('Expected "el" to be defined')
		}

		return draggable({
			element: el,
			getInitialData: () => ({ dragging, location: animal.location, pieceType: animal.uuid }),
			canDrag: () => {
				// On mobile, require a longer press to start dragging
				if (isMobile) {
					return Date.now() - touchStartTime > 300
				}
				return true
			},
			onDragStart: () => setDragging(true),
			onDrop: () => setDragging(false),
		})
	}, [dragging, animal, isMobile, touchStartTime])
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 cursor-grab transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${
				dragging
					? 'shadow-lg scale-105 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500'
					: 'hover:border-gray-300 dark:hover:border-gray-500'
			} ${isMobile ? 'touch-manipulation select-none' : ''}`}
			ref={ref}
			role="button"
			tabIndex={0}
			aria-label={`Animal ${animal.animalId}, ${animal.breed}, ${animal.gender}`}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			{...props}
		>
			<div className="flex items-center gap-4">
				{/* Animal Avatar */}
				<div className="relative shrink-0">
					<div className="w-18 h-18 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 border-gray-200 dark:border-gray-600">
						<img
							className="w-full h-full object-cover pointer-events-none"
							src={animal.picture || '/assets/default-imgs/cow.svg'}
							alt={`Animal ${animal.animalId}`}
						/>
					</div>
					{/* Gender indicator */}
					<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
						{animal.gender.toLowerCase() === 'male' ? (
							<i className="i-material-symbols-male bg-blue-500! dark:bg-blue-400! w-6! h-6!" />
						) : (
							<i className="i-material-symbols-female bg-pink-500! dark:bg-pink-400! w-6! h-6!" />
						)}
					</div>
				</div>

				{/* Animal Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-2">
						<span className="font-bold text-gray-900 dark:text-gray-100 text-xl">
							#{animal.animalId}
						</span>
						{dragging && (
							<i className="i-material-symbols-drag-indicator w-5! h-5! text-gray-400 dark:text-gray-500" />
						)}
					</div>
					<p className="text-gray-600 dark:text-gray-300 font-medium">{animal.breed}</p>
				</div>

				{/* Drag Handle */}
				<div className="shrink-0 opacity-40 hover:opacity-60 transition-opacity">
					<i className="i-material-symbols-drag-handle w-5! h-5! text-gray-400 dark:text-gray-500" />
				</div>
			</div>
		</div>
	)
}
