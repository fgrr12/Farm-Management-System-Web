import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { type MouseEvent, memo, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { ActionButton } from '@/components/ui/ActionButton'

import type { AnimalCardProps, CardProps } from './AnimalCard.types'

export const AnimalCard: FC<AnimalCardProps> = memo(
	({
		animal,
		healthStatus,
		lastHealthCheck,
		productionStatus,
		age,
		weight,
		notes,
		variant = 'default',
		className,
		...rest
	}) => {
		const navigate = useNavigate()
		const cardRef = useRef<HTMLDivElement>(null)
		const { uuid, animalId, breedName, gender, picture } = animal

		// Use health status from animal model, fallback to prop, then unknown
		const currentHealthStatus = animal.healthStatus || healthStatus || 'unknown'

		const cardClasses = useMemo(() => {
			const baseClasses =
				'relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 dark:border-gray-700'

			const variantClasses = {
				default: 'p-6',
				compact: 'p-4',
				detailed: 'p-6',
			}

			return `${baseClasses} ${variantClasses[variant]} ${className || ''}`
		}, [variant, className])

		const healthConfig = useMemo(() => {
			// Check if animal is sold or dead first
			if (animal.soldDate) {
				return {
					color: 'from-blue-400 to-blue-500',
					icon: 'i-material-symbols-sell',
					text: 'Sold',
					bgColor: 'bg-blue-100 dark:bg-blue-900/30',
					textColor: 'text-blue-800 dark:text-blue-200',
				}
			}

			if (animal.deathDate) {
				return {
					color: 'from-gray-600 to-gray-700',
					icon: 'i-material-symbols-deceased',
					text: 'Deceased',
					bgColor: 'bg-gray-200 dark:bg-gray-800',
					textColor: 'text-gray-800 dark:text-gray-300',
				}
			}

			const configs = {
				healthy: {
					color: 'from-green-500 to-emerald-600',
					icon: 'i-material-symbols-health-and-safety',
					text: 'Healthy',
					bgColor: 'bg-green-100 dark:bg-green-900/30',
					textColor: 'text-green-800 dark:text-green-200',
				},
				sick: {
					color: 'from-orange-600 to-red-500',
					icon: 'i-material-symbols-sick',
					text: 'Sick',
					bgColor: 'bg-orange-200 dark:bg-orange-900/30',
					textColor: 'text-orange-900 dark:text-orange-200',
				},
				treatment: {
					color: 'from-yellow-500 to-amber-500',
					icon: 'i-material-symbols-medication',
					text: 'Treatment',
					bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
					textColor: 'text-yellow-800 dark:text-yellow-200',
				},
				critical: {
					color: 'from-red-700 to-rose-800',
					icon: 'i-material-symbols-emergency',
					text: 'Critical',
					bgColor: 'bg-red-300 dark:bg-red-900/50',
					textColor: 'text-red-900 dark:text-red-100',
				},
				unknown: {
					color: 'from-gray-400 to-gray-500',
					icon: 'i-material-symbols-help',
					text: 'Check Needed',
					bgColor: 'bg-gray-100 dark:bg-gray-700',
					textColor: 'text-gray-600 dark:text-gray-400',
				},
			}
			return configs[currentHealthStatus]
		}, [currentHealthStatus, animal.soldDate, animal.deathDate])

		const genderConfig = useMemo(() => {
			return gender.toLowerCase() === 'male'
				? {
						icon: 'i-tdesign-gender-male',
						color: 'bg-blue-500!',
						bgColor: 'bg-blue-100',
						textColor: 'text-blue-800',
					}
				: {
						icon: 'i-tdesign-gender-female',
						color: 'bg-pink-500!',
						bgColor: 'bg-pink-100',
						textColor: 'text-pink-800',
					}
		}, [gender])

		useGSAP(() => {
			if (cardRef.current) {
				gsap.fromTo(
					cardRef.current,
					{ y: 20, opacity: 0, scale: 0.95 },
					{ y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
				)
			}
		}, [])

		const handleMouseEnter = useCallback(() => {
			if (cardRef.current) {
				gsap.to(cardRef.current, {
					scale: 1.03,
					y: -8,
					duration: 0.3,
					ease: 'power2.out',
				})
			}
		}, [])

		const handleMouseLeave = useCallback(() => {
			if (cardRef.current) {
				gsap.to(cardRef.current, {
					scale: 1,
					y: 0,
					duration: 0.3,
					ease: 'power2.out',
				})
			}
		}, [])

		const navigateToAnimal = useCallback(
			(e: MouseEvent<HTMLDivElement>) => {
				e.stopPropagation()
				const route = AppRoutes.ANIMAL.replace(':animalUuid', uuid)
				navigate(route)
			},
			[uuid, navigate]
		)

		const navigateToAddHealthRecord = useCallback(
			(e: MouseEvent<HTMLButtonElement>) => {
				e.stopPropagation()
				const route = AppRoutes.ADD_HEALTH_RECORD.replace(':animalUuid', uuid)
				navigate(route)
			},
			[uuid, navigate]
		)

		const navigateToAddProductionRecord = useCallback(
			(e: MouseEvent<HTMLButtonElement>) => {
				e.stopPropagation()
				const route = AppRoutes.ADD_PRODUCTION_RECORD.replace(':animalUuid', uuid)
				navigate(route)
			},
			[uuid, navigate]
		)

		const navigateToAddRelatedAnimal = useCallback(
			(e: MouseEvent<HTMLButtonElement>) => {
				e.stopPropagation()
				const route = AppRoutes.RELATED_ANIMALS.replace(':animalUuid', uuid)
				navigate(route)
			},
			[uuid, navigate]
		)

		return (
			<div
				ref={cardRef}
				role="button"
				tabIndex={0}
				className={`${cardClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-200`}
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
				{...rest}
			>
				{/* Background Gradient */}
				<div
					className={`absolute inset-0 bg-gradient-to-br ${healthConfig.color} opacity-3 dark:opacity-8 group-hover:opacity-8 dark:group-hover:opacity-12 transition-opacity duration-300 rounded-lg`}
				/>

				{/* Health Status Indicator */}
				<div className="absolute top-4 right-4">
					<div
						className={`${healthConfig.bgColor} ${healthConfig.textColor} px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium shadow-sm dark:shadow-md`}
					>
						<i className={`${healthConfig.icon} w-3! h-3! bg-current!`} />
						<span className="hidden sm:inline">{healthConfig.text}</span>
					</div>
				</div>

				{/* Animal Avatar/Image */}
				<div className="flex justify-center mb-4">
					{picture ? (
						<div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-600 shadow-lg dark:shadow-xl">
							<img
								src={picture}
								alt={`Animal ${animalId}`}
								className="w-full h-full object-cover"
							/>
						</div>
					) : (
						<div
							className={`w-16 h-16 rounded-full bg-gradient-to-br ${healthConfig.color} flex items-center justify-center shadow-lg dark:shadow-xl border-2 border-white dark:border-gray-600`}
						>
							<i className="i-healthicons-animal-cow w-8! h-8! bg-white! dark:bg-gray-100!" />
						</div>
					)}
				</div>

				{/* Animal ID */}
				<div className="text-center mb-3">
					<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{animalId}</h3>
				</div>

				{/* Breed and Gender */}
				<div className="flex items-center justify-center gap-2 mb-4">
					<span className="text-lg font-medium text-gray-700 dark:text-gray-300">{breedName}</span>
					<div
						className={`${genderConfig.bgColor} ${genderConfig.textColor} px-2 py-1 rounded-full flex items-center gap-1 shadow-sm dark:shadow-md`}
					>
						<i className={`${genderConfig.icon} w-4! h-4! ${genderConfig.color}`} />
						<span className="text-xs font-medium capitalize">{gender}</span>
					</div>
				</div>

				{/* Additional Info (for detailed variant) */}
				{variant === 'detailed' && (
					<div className="grid grid-cols-2 gap-2 mb-4 text-sm">
						{age && (
							<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700">
								<div className="text-gray-500 dark:text-gray-400 text-xs">Age</div>
								<div className="font-semibold text-gray-900 dark:text-gray-100">{age}y</div>
							</div>
						)}
						{weight && (
							<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700">
								<div className="text-gray-500 dark:text-gray-400 text-xs">Weight</div>
								<div className="font-semibold text-gray-900 dark:text-gray-100">{weight}kg</div>
							</div>
						)}
					</div>
				)}

				{/* Notes (if any) */}
				{notes && variant !== 'compact' && (
					<div className="mb-4">
						<p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">{notes}</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex justify-center items-center gap-1">
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

				{/* Last Health Check (if available) */}
				{lastHealthCheck && variant !== 'compact' && (
					<div className="absolute bottom-2 left-4 text-xs text-gray-500 dark:text-gray-400">
						Last check: {lastHealthCheck}
					</div>
				)}
			</div>
		)
	}
)

// Legacy support
export const LegacyAnimalCard: FC<CardProps> = (props) => {
	return <AnimalCard {...props} />
}
