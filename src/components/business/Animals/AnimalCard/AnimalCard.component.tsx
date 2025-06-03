import { ActionButton } from '@/components/ui/ActionButton'
import type { CardProps } from './AnimalCard.types'
import { useNavigate } from 'react-router-dom'
import { AppRoutes } from '@/config/constants/routes'
import { MouseEvent } from 'react'

export const AnimalCard: FC<CardProps> = ({ uuid, animalId, breed, gender, ...props }) => {
	const navigate = useNavigate()

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
	return (
		<div
			className="rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer hover:bg-gray-200 hover:animate-pulse w-full"
			onClick={navigateToAnimal}
			{...props}
		>
			<div className="flex justify-center items-center">
				<span className="text-xl font-bold">#{animalId}</span>
			</div>
			<div className="flex items-center justify-center">
				<span className="font-medium text-gray-500 text-lg pr-1">{breed.name}</span>
				{gender.toLowerCase() === 'male' ? (
					<i className="i-tdesign-gender-male bg-blue-500! w-5! h-5!" />
				) : (
					<i className="i-tdesign-gender-female bg-pink-500! w-5! h-5!" />
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
