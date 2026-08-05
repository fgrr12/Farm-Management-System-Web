import dayjs from 'dayjs'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'

import { formatActivityItem } from '@/utils/formatActivityItem'
import { groupActivitiesByDay } from '@/utils/groupActivitiesByDay'
import { printProductionSummary } from '@/utils/productionSummaryPrintable'

import { useActivityFeed } from '@/hooks/queries/useDashboard'

type Range = 'today' | 'week' | 'month'

const RANGE_UNITS: Record<Range, [number, dayjs.ManipulateType]> = {
	today: [0, 'day'],
	week: [6, 'day'],
	month: [1, 'month'],
}

export const ActivityFeed = memo(() => {
	const { t } = useTranslation(['activityFeed'])
	const { t: healthT } = useTranslation(['healthRecordForm'])
	const { t: printT } = useTranslation(['printable'])
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const [range, setRange] = useState<Range>('today')

	const { startDate, endDate } = useMemo(() => {
		const [amount, unit] = RANGE_UNITS[range]
		return {
			startDate: dayjs().subtract(amount, unit).format('YYYY-MM-DD'),
			endDate: dayjs().format('YYYY-MM-DD'),
		}
	}, [range])

	const { data: activities, isLoading } = useActivityFeed(startDate, endDate)
	const groups = useMemo(() => groupActivitiesByDay(activities || []), [activities])
	const productionRecords = useMemo(
		() => (activities || []).filter((item) => item.kind === 'production'),
		[activities]
	)

	const goToAnimal = (animalUuid?: string) => {
		if (!animalUuid) return
		navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
	}

	const handlePrintProduction = useCallback(() => {
		if (!farm) return
		printProductionSummary({
			farm,
			rangeLabel: t(`range.${range}`),
			records: productionRecords,
			t: printT,
		})
	}, [farm, range, productionRecords, t, printT])

	return (
		<div className="flex flex-col gap-4">
			{/* Range selector */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="inline-flex self-start rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
					{(['today', 'week', 'month'] as const).map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setRange(option)}
							className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
								range === option
									? 'bg-blue-600 text-white shadow-sm'
									: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
							}`}
						>
							{t(`range.${option}`)}
						</button>
					))}
				</div>

				{productionRecords.length > 0 && (
					<button
						type="button"
						onClick={handlePrintProduction}
						className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
					>
						<i className="i-material-symbols-print-outline w-4! h-4!" />
						{printT('print')}
					</button>
				)}
			</div>

			{isLoading && (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
						/>
					))}
				</div>
			)}

			{!isLoading && groups.length === 0 && (
				<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
					<i className="i-material-symbols-history w-12! h-12! text-gray-300 dark:text-gray-600 mx-auto mb-3" />
					<p className="text-gray-500 dark:text-gray-400">{t('empty')}</p>
				</div>
			)}

			{!isLoading &&
				groups.map((group) => (
					<div key={group.dateKey} className="flex flex-col gap-2">
						<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
							{group.dayKind === 'today'
								? t('day.today')
								: group.dayKind === 'yesterday'
									? t('day.yesterday')
									: dayjs(group.dateKey).format('DD/MM/YYYY')}
						</h3>
						<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
							{group.items.map((item) => {
								const formatted = formatActivityItem(item, t, healthT, farm?.liquidUnit)
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => goToAnimal(item.animalUuid)}
										disabled={!item.animalUuid}
										className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
											item.animalUuid
												? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
												: 'cursor-default'
										}`}
									>
										<span className="shrink-0 w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
											<i className={`${formatted.icon} w-4! h-4! bg-blue-600! dark:bg-blue-400!`} />
										</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{formatted.title}
											</p>
											{formatted.description && (
												<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
													{formatted.description}
												</p>
											)}
										</div>
										{/* Health/production records only carry a date, no time of day —
										only tasks (createdAt/updatedAt) have real time granularity to show. */}
										{item.kind === 'task' && (
											<span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
												{dayjs(item.date).format('HH:mm')}
											</span>
										)}
									</button>
								)
							})}
						</div>
					</div>
				))}
		</div>
	)
})

ActivityFeed.displayName = 'ActivityFeed'
