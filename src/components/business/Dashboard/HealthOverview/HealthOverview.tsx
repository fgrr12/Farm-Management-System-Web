import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const HealthOverview = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { healthOverview, loading, loadingSecondary } = useDashboardData()

	const containerRef = useRef<HTMLDivElement>(null)
	const itemsRef = useRef<HTMLDivElement[]>([])
	const totalRef = useRef<HTMLSpanElement>(null)
	const [displayCounts, setDisplayCounts] = useState<number[]>([0, 0, 0, 0])
	const [displayTotal, setDisplayTotal] = useState(0)

	const healthItems = [
		{
			label: t('health.healthy'),
			count: healthOverview.healthy,
			color: 'bg-green-500',
			textColor: 'text-green-700 dark:text-green-400',
			bgColor: 'bg-green-50 dark:bg-green-900/20',
			hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30',
			icon: 'i-material-symbols-favorite',
			iconColor: 'bg-green-600! dark:bg-green-500!',
		},
		{
			label: t('health.sick'),
			count: healthOverview.sick,
			color: 'bg-red-500',
			textColor: 'text-red-700 dark:text-red-400',
			bgColor: 'bg-red-50 dark:bg-red-900/20',
			hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
			icon: 'i-material-symbols-sick',
			iconColor: 'bg-red-600! dark:bg-red-500!',
		},
		{
			label: t('health.treatment'),
			count: healthOverview.inTreatment,
			color: 'bg-yellow-500',
			textColor: 'text-yellow-700 dark:text-yellow-400',
			bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
			hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
			icon: 'i-material-symbols-medication',
			iconColor: 'bg-yellow-600! dark:bg-yellow-500!',
		},
		{
			label: t('health.checkupDue'),
			count: healthOverview.checkupDue,
			color: 'bg-blue-500',
			textColor: 'text-blue-700 dark:text-blue-400',
			bgColor: 'bg-blue-50 dark:bg-blue-900/20',
			hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
			icon: 'i-material-symbols-schedule',
			iconColor: 'bg-blue-600! dark:bg-blue-500!',
		},
	]

	useGSAP(() => {
		if (containerRef.current && !loading && !loadingSecondary) {
			gsap.fromTo(
				containerRef.current,
				{ y: 30, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
			)
		}
	}, [loading, loadingSecondary])

	useGSAP(() => {
		if (itemsRef.current.length && !loading && !loadingSecondary) {
			gsap.fromTo(
				itemsRef.current,
				{ x: -30, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 0.5,
					ease: 'power2.out',
					stagger: 0.1,
					delay: 0.3,
				}
			)
		}
	}, [loading, loadingSecondary])

	useGSAP(() => {
		if (!loading && !loadingSecondary && healthItems.length) {
			healthItems.forEach((item, index) => {
				const obj = { value: 0 }
				gsap.to(obj, {
					value: item.count,
					duration: 1.2,
					ease: 'power2.out',
					delay: 0.5 + index * 0.1,
					onUpdate: () => {
						setDisplayCounts((prev) => {
							const newCounts = [...prev]
							newCounts[index] = Math.round(obj.value)
							return newCounts
						})
					},
				})
			})

			const totalValue = healthItems.reduce((sum, item) => sum + item.count, 0)
			const totalObj = { value: 0 }
			gsap.to(totalObj, {
				value: totalValue,
				duration: 1.5,
				ease: 'power2.out',
				delay: 1,
				onUpdate: () => {
					setDisplayTotal(Math.round(totalObj.value))
				},
			})
		}
	}, [loading, loadingSecondary, healthOverview])

	const setItemRef = useCallback(
		(index: number) => (el: HTMLDivElement | null) => {
			if (el) itemsRef.current[index] = el
		},
		[]
	)

	const handleMouseEnter = useCallback(() => {
		if (containerRef.current) {
			gsap.to(containerRef.current, {
				y: -2,
				duration: 0.3,
				ease: 'power2.out',
			})
		}
	}, [])

	const handleMouseLeave = useCallback(() => {
		if (containerRef.current) {
			gsap.to(containerRef.current, {
				y: 0,
				duration: 0.3,
				ease: 'power2.out',
			})
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
			role="region"
			aria-label="Health Overview"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				transform: 'translateZ(0)',
				willChange: 'transform',
			}}
		>
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Content container */}
			<div className="relative z-10">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
					{t('health.title')}
				</h3>

				<div className="space-y-3">
					{healthItems.map((item, index) => {
						const refCallback = setItemRef(index)
						return (
							<div
								key={index}
								ref={refCallback}
								className={`p-4 rounded-lg ${item.bgColor} ${item.hoverBg} transition-all duration-200 cursor-pointer group`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="relative">
											<div
												className={`w-3 h-3 rounded-full ${item.color} group-hover:scale-110 transition-transform`}
											/>
											<div
												className={`absolute inset-0 w-3 h-3 rounded-full ${item.color} opacity-30 group-hover:scale-150 transition-transform`}
											/>
										</div>
										<i
											className={`${item.icon} w-4! h-4! ${item.iconColor} group-hover:scale-110 transition-transform`}
										/>
										<span
											className={`font-medium ${item.textColor} group-hover:font-semibold transition-all`}
										>
											{item.label}
										</span>
									</div>
									<span
										className={`text-xl font-bold ${item.textColor} tabular-nums group-hover:scale-105 transition-transform`}
									>
										{loading || loadingSecondary ? '...' : displayCounts[index]}
									</span>
								</div>
							</div>
						)
					})}
				</div>

				<div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
							{t('health.totalAnimals')}
						</span>
						<span
							ref={totalRef}
							className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums"
						>
							{loading || loadingSecondary ? '...' : displayTotal}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
})
