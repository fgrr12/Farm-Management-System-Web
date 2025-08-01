import { useGSAP } from '@gsap/react'
import dayjs from 'dayjs'
import gsap from 'gsap'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'
import { useProductionData } from '@/hooks/dashboard/useProductionData'

export const ProductionChart = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { farm } = useFarmStore()
	const [selectedYear, setSelectedYear] = useState(dayjs().year())
	const { loadingTertiary } = useDashboardData()

	const { productionData, loading: productionLoading } = useProductionData(selectedYear)

	const chartRef = useRef<HTMLDivElement>(null)
	const barsRef = useRef<HTMLDivElement[]>([])
	const totalRef = useRef<HTMLSpanElement>(null)

	const yearOptions = useMemo(() => {
		const currentYear = dayjs().year()
		const years = []
		for (let i = 0; i < 5; i++) {
			years.push(currentYear - i)
		}
		return years
	}, [])

	const chartData = useMemo(() => {
		if (!productionData?.length) return []

		const maxValue = Math.max(...productionData.map((d) => d.value))
		return productionData.map((item) => ({
			...item,
			percentage: (item.value / maxValue) * 100,
		}))
	}, [productionData])

	useGSAP(() => {
		if (chartRef.current && !loadingTertiary && !productionLoading) {
			gsap.fromTo(
				chartRef.current,
				{ y: 30, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
			)
		}
	}, [loadingTertiary, productionLoading])

	useGSAP(() => {
		if (barsRef.current.length && chartData.length && !loadingTertiary && !productionLoading) {
			gsap.set(barsRef.current, { width: '0%' })

			gsap.to(barsRef.current, {
				width: (i) => `${chartData[i]?.percentage || 0}%`,
				duration: 1.2,
				ease: 'power2.out',
				stagger: 0.1,
				delay: 0.3,
			})
		}
	}, [chartData, loadingTertiary, productionLoading])

	useGSAP(() => {
		if (totalRef.current && chartData.length && !loadingTertiary && !productionLoading) {
			const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)
			const obj = { value: 0 }

			gsap.to(obj, {
				value: totalValue,
				duration: 1.5,
				ease: 'power2.out',
				delay: 0.8,
				onUpdate: () => {
					if (totalRef.current) {
						totalRef.current.textContent = `${Math.round(obj.value)}${farm?.liquidUnit}`
					}
				},
			})
		}
	}, [chartData, loadingTertiary, productionLoading])

	const setBarRef = useCallback(
		(index: number) => (el: HTMLDivElement | null) => {
			if (el) barsRef.current[index] = el
		},
		[]
	)

	const handleMouseEnter = useCallback(() => {
		if (chartRef.current) {
			gsap.to(chartRef.current, {
				y: -2,
				duration: 0.3,
				ease: 'power2.out',
			})
		}
	}, [])

	const handleMouseLeave = useCallback(() => {
		if (chartRef.current) {
			gsap.to(chartRef.current, {
				y: 0,
				duration: 0.3,
				ease: 'power2.out',
			})
		}
	}, [])

	if (loadingTertiary || productionLoading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
					<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
				</div>
			</div>
		)
	}

	return (
		<div
			ref={chartRef}
			className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
			role="region"
			aria-label="Production Chart"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				transform: 'translateZ(0)',
				willChange: 'transform',
			}}
		>
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{t('charts.productionTrend')}
				</h3>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-water-drop w-6! h-6! bg-blue-500!" />
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{t('charts.production')}
						</span>
					</div>
					<select
						value={selectedYear}
						onChange={(e) => setSelectedYear(Number(e.target.value))}
						className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
					>
						{yearOptions.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="space-y-4">
				{chartData.map((item, index) => {
					const refCallback = setBarRef(index)
					return (
						<div key={index} className="flex items-center gap-4 group">
							<div className="w-16 text-sm text-gray-600 dark:text-gray-400 font-medium">
								{item.month}
							</div>
							<div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
								<div
									ref={refCallback}
									className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors"
									style={{ width: '0%' }}
								>
									<span className="text-white text-sm font-medium tabular-nums">
										{item.value}
										{farm?.liquidUnit}
									</span>
								</div>
							</div>
							<div className="w-16 text-sm text-gray-900 dark:text-gray-100 font-semibold text-right tabular-nums">
								{item.value}
								{farm?.liquidUnit}
							</div>
						</div>
					)
				})}
			</div>

			<div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 dark:text-gray-400">{t('charts.totalProduction')}</span>
					<span
						ref={totalRef}
						className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums"
					>
						0{farm?.liquidUnit}
					</span>
				</div>
			</div>
		</div>
	)
})
