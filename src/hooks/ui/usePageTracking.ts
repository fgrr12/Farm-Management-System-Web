import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useAppStore } from '@/store/useAppStore'

import { ANALYTICS_EVENTS, trackEvent } from '@/utils/analytics'

// Route to page name mapping
const PAGE_NAMES: Record<string, string> = {
	'/': 'Home',
	'/animals': 'Animals',
	'/animals/add': 'Add Animal',
	'/animals/edit': 'Edit Animal',
	'/animal': 'Animal Detail',
	'/employees': 'Employees',
	'/employees/add': 'Add Employee',
	'/employees/edit': 'Edit Employee',
	'/tasks': 'Tasks',
	'/tasks/add': 'Add Task',
	'/my-account': 'My Account',
	'/my-species': 'My Species',
	'/billing-card': 'Billing Card',
	'/login': 'Login',
}

/**
 * Hook for automatic page tracking
 */
export const usePageTracking = () => {
	const location = useLocation()
	const { headerTitle } = useAppStore()

	useEffect(() => {
		const pageName = PAGE_NAMES[location.pathname] || headerTitle || 'Unknown Page'

		trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
			page: pageName,
			path: location.pathname,
			search: location.search,
			timestamp: new Date().toISOString(),
		})

		if (!document.title.includes(' - ')) {
			document.title = pageName
				? `${pageName} - Cattle Farm Management System`
				: 'Cattle Farm Management System'
		}
	}, [location.pathname, location.search, headerTitle])
}
