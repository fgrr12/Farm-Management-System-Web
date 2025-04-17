import type { CardProps } from './AnimalCard.types'

export const AnimalCard: FC<CardProps> = ({ animalId, breed, gender, ...props }) => {
	return (
		<div
			className="rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer hover:bg-gray-200 hover:animate-pulse"
			{...props}
		>
			<div className="flex justify-center items-center mb-4">
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
		</div>
	)
}
