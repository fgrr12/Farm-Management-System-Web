import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { type MouseEvent, memo, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { ActionButton } from '@/components/ui/ActionButton'

import type { AnimalCardProps } from './AnimalCard.types'

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
		const { t } = useTranslation(['animals'])
		const navigate = useNavigate()
		const cardRef = useRef<HTMLDivElement>(null)
		const { uuid, animalId, breedName, gender, picture } = animal

		const currentHealthStatus = animal.healthStatus || healthStatus || 'unknown'

		const cardClasses = useMemo(() => {
			const baseClasses =
				'relative bg-white/5 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-white/10 hover:bg-white/10 hover:scale-[1.02]'

			const variantClasses = {
				default: 'p-6',
				compact: 'p-4',
				detailed: 'p-6',
			}

			return `${baseClasses} ${variantClasses[variant]} ${className || ''}`
		}, [variant, className])

		const healthConfig = useMemo(() => {
			if (animal.soldDate) {
				return {
					color: 'from-blue-400 to-blue-500',
					icon: 'i-material-symbols-sell',
					text: t('healthStatus.sold'),
					bgColor: 'bg-blue-100 dark:bg-blue-900/30',
					textColor: 'text-blue-800 dark:text-blue-200',
				}
			}

			if (animal.deathDate) {
				return {
					color: 'from-gray-600 to-gray-700',
					icon: 'i-material-symbols-deceased',
					text: t('healthStatus.deceased'),
					bgColor: 'bg-gray-200 dark:bg-gray-800',
					textColor: 'text-gray-800 dark:text-gray-300',
				}
			}

			const configs = {
				healthy: {
					color: 'from-green-500 to-emerald-600',
					icon: 'i-material-symbols-health-and-safety',
					text: t('healthStatus.healthy'),
					bgColor: 'bg-green-100 dark:bg-green-900/30',
					textColor: 'text-green-800 dark:text-green-200',
				},
				sick: {
					color: 'from-orange-600 to-red-500',
					icon: 'i-material-symbols-sick',
					text: t('healthStatus.sick'),
					bgColor: 'bg-orange-200 dark:bg-orange-900/30',
					textColor: 'text-orange-900 dark:text-orange-200',
				},
				treatment: {
					color: 'from-yellow-500 to-amber-500',
					icon: 'i-material-symbols-medication',
					text: t('healthStatus.treatment'),
					bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
					textColor: 'text-yellow-800 dark:text-yellow-200',
				},
				critical: {
					color: 'from-red-700 to-rose-800',
					icon: 'i-material-symbols-emergency',
					text: t('healthStatus.critical'),
					bgColor: 'bg-red-300 dark:bg-red-900/50',
					textColor: 'text-red-900 dark:text-red-100',
				},
				unknown: {
					color: 'from-gray-400 to-gray-500',
					icon: 'i-material-symbols-help',
					text: t('healthStatus.checkNeeded'),
					bgColor: 'bg-gray-100 dark:bg-gray-700',
					textColor: 'text-gray-600 dark:text-gray-400',
				},
				withdrawal: {
					color: 'from-red-600 to-orange-600',
					icon: 'i-material-symbols-warning',
					text: t('healthStatus.withdrawal'),
					bgColor: 'bg-red-200 dark:bg-red-900/40',
					textColor: 'text-red-900 dark:text-red-100',
				},
			}
			return configs[currentHealthStatus]
		}, [currentHealthStatus, animal.soldDate, animal.deathDate, t])

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
				className={`${cardClasses} shadow-lg hover:shadow-2xl transition-all duration-500 group`}
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
				{/* Ambient Glow (Health Status Color) */}
				<div
					className={`absolute -inset-1 bg-linear-to-b ${healthConfig.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700`}
				/>

				{/* Glass Reflection Overlay */}
				<div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

				<div className="relative z-10 flex flex-col items-center">
					{/* Avatar with Glowing Status Ring */}
					<div className="relative mb-6 mt-2">
						{/* Status Glow Ring */}
						<div
							className={`absolute -inset-4 bg-linear-to-tr ${healthConfig.color} rounded-full opacity-40 blur-md animate-pulse`}
						/>

						{/* Avatar Container */}
						<div className="relative w-24 h-24 rounded-full p-[3px] bg-linear-to-tr from-white/20 to-white/5 backdrop-blur-md shadow-2xl">
							<div
								className={
									'w-full h-full rounded-full overflow-hidden border-2 border-white/10 relative z-10 bg-black/20'
								}
							>
								{picture ? (
									<img
										src={picture}
										alt={`Animal ${animalId}`}
										className="w-full h-full object-cover"
									/>
								) : (
									<div
										className={`w-full h-full flex items-center justify-center bg-linear-to-br ${healthConfig.color} opacity-80`}
									>
										<i className="i-healthicons-animal-cow w-10! h-10! text-white" />
									</div>
								)}
							</div>
						</div>

						{/* Status Icon (Floating Bubble) */}
						<div
							className={`absolute -bottom-1 -right-1 h-8 rounded-full ${healthConfig.bgColor} border-2 border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md z-20 transition-all duration-300 ease-out w-8 group-hover:w-auto group-hover:px-3`}
						>
							<i className={`${healthConfig.icon} w-4! h-4! ${healthConfig.textColor} shrink-0`} />
							<span
								className={`text-[10px] font-bold uppercase tracking-wider ${healthConfig.textColor} overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap`}
							>
								{healthConfig.text}
							</span>
						</div>
					</div>

					{/* Animal ID */}
					<h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg mb-1">
						#{animalId}
					</h3>

					{/* Breed & Gender Pill */}
					<div className="flex items-center gap-2 mb-6 bg-white/5 rounded-full px-4 py-1.5 border border-white/5 backdrop-blur-sm">
						<span className="text-sm font-medium text-gray-300">{breedName}</span>
						<div className="w-1 h-1 rounded-full bg-white/20" />
						<div className="flex items-center gap-1.5">
							<i className={`${genderConfig.icon} w-3.5! h-3.5! ${genderConfig.textColor}`} />
							<span
								className={`text-xs font-semibold uppercase tracking-wide ${genderConfig.textColor}`}
							>
								{gender}
							</span>
						</div>
					</div>

					{/* Stats Grid (Detailed Variant) */}
					{variant === 'detailed' && (
						<div className="grid grid-cols-2 gap-3 w-full mb-6">
							{age && (
								<div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
									<div className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
										{t('animalCard.age')}
									</div>
									<div className="font-bold text-white text-lg">
										{age}
										<span className="text-xs text-gray-500 ml-0.5">y</span>
									</div>
								</div>
							)}
							{weight && (
								<div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
									<div className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
										{t('animalCard.weight')}
									</div>
									<div className="font-bold text-white text-lg">
										{weight}
										<span className="text-xs text-gray-500 ml-0.5">kg</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Action Buttons (Floating) */}
					<div className="flex items-center gap-2 mt-auto">
						<ActionButton
							title={t('animalCard.addHealthRecord')}
							icon="i-material-symbols-light-health-metrics-rounded"
							onClick={navigateToAddHealthRecord}
						/>
						<ActionButton
							title={t('animalCard.addProductionRecord')}
							icon="i-icon-park-outline-milk"
							onClick={navigateToAddProductionRecord}
						/>
						<ActionButton
							title={t('animalCard.addRelatedAnimal')}
							icon="i-tabler-circles-relation"
							onClick={navigateToAddRelatedAnimal} />
					</div>
				</div>
			</div>
		)
	}
)
