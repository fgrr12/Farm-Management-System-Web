import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@/components/business/Calendar/Calendar'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const CalendarPage = memo(() => {
	const { t } = useTranslation(['calendar'])
	const { setPageTitle } = usePagePerformance()

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen md:min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<Calendar />
			</div>
		</div>
	)
})

CalendarPage.displayName = 'CalendarPage'

export default CalendarPage
