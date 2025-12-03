import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@/components/business/Calendar/Calendar'
import { PageContainer } from '@/components/layout/PageContainer'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const CalendarPage = memo(() => {
	const { t } = useTranslation(['calendar'])
	const { setPageTitle } = usePagePerformance()

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer maxWidth="7xl">
			<Calendar />
		</PageContainer>
	)
})

CalendarPage.displayName = 'CalendarPage'

export default CalendarPage
