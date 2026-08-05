import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ActivityFeed } from '@/components/business/ActivityFeed/ActivityFeed.component'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const ActivityFeedPage = memo(() => {
	const { t } = useTranslation(['activityFeed'])
	const { setPageTitle } = usePagePerformance()

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer maxWidth="3xl">
			<PageHeader icon="history" title={t('title')} subtitle={t('subtitle')} variant="compact" />
			<ActivityFeed />
		</PageContainer>
	)
})

ActivityFeedPage.displayName = 'ActivityFeedPage'

export default ActivityFeedPage
