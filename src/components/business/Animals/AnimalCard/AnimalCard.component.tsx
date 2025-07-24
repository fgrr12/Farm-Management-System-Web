import { gsap } from 'gsap'
import { type MouseEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { ActionButton } from '@/components/ui/ActionButton'

import type { CardProps } from './AnimalCard.types'

export const AnimalCard: FC<CardProps> = ({ uuid, animalId, breedName, gender }) => {
	const navigate = useNavigate()
	const divRef = useRef<HTMLDivElement>(null)

	const navigateToAnimal = (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		const route = AppRoutes.ANIMAL.replace(':animalUuid', uuid)
		navigate(route)
	}

	const navigateToAddHealthRecord = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		const route = AppRoutes.ADD_HEALTH_RECORD.replace(':animalUuid', uuid)
		navigate(route)
	}
	const navigateToAddProductionRecord = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		const route = AppRoutes.ADD_PRODUCTION_RECORD.replace(':animalUuid', uuid)
		navigate(route)
	}
	const navigateToAddRelatedAnimal = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		const route = AppRoutes.RELATED_ANIMALS.replace(':animalUuid', uuid)
		navigate(route)
	}

	const handleMouseEnter = () => {
		gsap.to(divRef.current, { scale: 1.05, duration: 0.2, ease: 'power1.out' })
	}

	const handleMouseLeave = () => {
		gsap.to(divRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
	}

	return (
		<div
			ref={divRef}
			role="button"
			tabIndex={0}
			className="animal-card rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer hover:bg-gray-200 hover:animate-pulse w-full"
			onClick={navigateToAnimal}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					navigateToAnimal(e as any)
				}
			}}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			aria-label={`Animal ${animalId}, ${breedName}, ${gender}`}
		>
			<div className="flex justify-center items-center">
				<span className="text-3xl font-bold">#{animalId}</span>
			</div>
			<div className="flex items-center justify-center">
				<span className="font-medium text-gray-500 text-xl pr-1">{breedName}</span>
				{gender.toLowerCase() === 'male' ? (
					<i className="i-tdesign-gender-male bg-blue-500! w-8! h-8!" />
				) : (
					<i className="i-tdesign-gender-female bg-pink-500! w-8! h-8!" />
				)}
			</div>
			<div className="flex justify-center items-center mt-2">
				<ActionButton
					title="Add Health Record"
					icon="i-material-symbols-light-health-metrics-rounded"
					onClick={navigateToAddHealthRecord}
				/>
				<ActionButton
					title="Add Production Record"
					icon="i-icon-park-outline-milk"
					onClick={navigateToAddProductionRecord}
				/>
				<ActionButton
					title="Add Related Animal"
					icon="i-tabler-circles-relation"
					onClick={navigateToAddRelatedAnimal}
				/>
			</div>
		</div>
	)
}
