import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface StatCardProps {
	title: string
	value: string | number
	change?: number
	icon: string
	color: 'blue' | 'green' | 'orange' | 'purple'
	loading?: boolean
	changeLoading?: boolean
}

const colorClasses = {
	blue: {
		bg: 'bg-blue-50 dark:bg-blue-900/20',
		icon: 'bg-blue-600! dark:bg-blue-500!',
		change: 'text-blue-600 dark:text-blue-400',
	},
	green: {
		bg: 'bg-green-50 dark:bg-green-900/20',
		icon: 'bg-green-600! dark:bg-green-500!',
		change: 'text-green-600 dark:text-green-400',
	},
	orange: {
		bg: 'bg-orange-50 dark:bg-orange-900/20',
		icon: 'bg-orange-600! dark:bg-orange-500!',
		change: 'text-orange-600 dark:text-orange-400',
	},
	purple: {
		bg: 'bg-purple-50 dark:bg-purple-900/20',
		icon: 'bg-purple-600! dark:bg-purple-500!',
		change: 'text-purple-600 dark:text-purple-400',
	},
}

export const StatCard = memo<StatCardProps>(
	({ title, value, change, icon, color, loading = false, changeLoading = false }) => {
		const { t } = useTranslation('dashboard')
		const colors = colorClasses[color]

		const cardRef = useRef<HTMLDivElement>(null)
		const valueRef = useRef<HTMLParagraphElement>(null)
		const changeRef = useRef<HTMLSpanElement>(null)
		const iconRef = useRef<HTMLElement>(null)
		const [displayValue, setDisplayValue] = useState<string | number>(0)
		const [displayChange, setDisplayChange] = useState<number>(0)

		// Extract numeric value for animation
		const numericValue =
			typeof value === 'string' ? Number.parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value || 0

		// Animate counter when value changes
		useEffect(() => {
			if (loading || numericValue === 0) return

			const obj = { value: 0 }
			gsap.to(obj, {
				value: numericValue,
				duration: 1.5,
				ease: 'power2.out',
				onUpdate: () => {
					const currentValue = Math.round(obj.value)
					if (typeof value === 'string' && value.includes('L')) {
						setDisplayValue(`${currentValue}L`)
					} else {
						setDisplayValue(currentValue)
					}
				},
			})
		}, [numericValue, loading, value])

		// Animate change percentage
		useEffect(() => {
			if (changeLoading || change === undefined || change === null) return

			const obj = { change: 0 }
			gsap.to(obj, {
				change: change,
				duration: 1,
				ease: 'power2.out',
				delay: 0.5,
				onUpdate: () => {
					setDisplayChange(Math.round(obj.change * 10) / 10)
				},
			})
		}, [change, changeLoading])

		// Card entrance animation
		useGSAP(() => {
			if (cardRef.current && !loading) {
				gsap.fromTo(
					cardRef.current,
					{ y: 30, opacity: 0, scale: 0.95 },
					{ y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
				)
			}
		}, [loading])

		// Icon pulse animation
		useGSAP(() => {
			if (iconRef.current && !loading) {
				gsap.fromTo(
					iconRef.current,
					{ scale: 0, rotation: -180 },
					{ scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3 }
				)
			}
		}, [loading])

		const handleMouseEnter = useCallback(() => {
			if (cardRef.current && !loading) {
				gsap.to(cardRef.current, {
					y: -4,
					duration: 0.3,
					ease: 'power2.out',
				})
			}
		}, [loading])

		const handleMouseLeave = useCallback(() => {
			if (cardRef.current && !loading) {
				gsap.to(cardRef.current, {
					y: 0,
					duration: 0.3,
					ease: 'power2.out',
				})
			}
		}, [loading])

		if (loading) {
			return (
				<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
							<div className="flex items-center mt-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-2" />
							</div>
						</div>
						<div className={`p-3 rounded-lg ${colors.bg}`}>
							<div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
						</div>
					</div>
				</div>
			)
		}

		return (
			<div
				ref={cardRef}
				className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/25 transition-all duration-300 cursor-pointer"
				role="button"
				tabIndex={0}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{
					transform: 'translateZ(0)',
					willChange: 'transform',
				}}
			>
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
						<p ref={valueRef} className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
							{loading ? '...' : displayValue}
						</p>
						{changeLoading ? (
							<div className="flex items-center mt-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-2 animate-pulse" />
							</div>
						) : (
							change !== undefined &&
							change !== null && (
								<div className="flex items-center mt-2">
									<span
										ref={changeRef}
										className={`text-sm font-medium tabular-nums ${displayChange > 0
											? 'text-green-600 dark:text-green-400'
											: displayChange < 0
												? 'text-red-600 dark:text-red-400'
												: 'text-gray-500 dark:text-gray-400'
											}`}
									>
										{displayChange > 0 && '+'}
										{displayChange}%
									</span>
									<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{t('common.vsLastMonth')}</span>
								</div>
							)
						)}
					</div>
					<div className={`p-3 rounded-lg ${colors.bg} transition-all duration-300`}>
						<i ref={iconRef} className={`w-6! h-6! ${icon} ${colors.icon}`} />
					</div>
				</div>
			</div>
		)
	}
)
