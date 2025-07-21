import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePageTracking } from '@/hooks/ui/usePageTracking'

// Mock react-router-dom
const mockLocation = {
	pathname: '/animals',
	search: '?filter=active',
}

vi.mock('react-router-dom', () => ({
	useLocation: () => mockLocation,
}))

// Mock store
const mockHeaderTitle = 'Test Page Title'
vi.mock('@/store/useAppStore', () => ({
	useAppStore: () => ({
		headerTitle: mockHeaderTitle,
	}),
}))

// Mock analytics - using factory function
vi.mock('@/utils/analytics', () => ({
	trackEvent: vi.fn(),
	ANALYTICS_EVENTS: {
		PAGE_VIEW: 'page_view',
	},
}))

describe('usePageTracking', () => {
	let mockTrackEvent: any

	beforeEach(async () => {
		vi.clearAllMocks()
		const analytics = await import('@/utils/analytics')
		mockTrackEvent = vi.mocked(analytics.trackEvent)
		// Reset document title
		document.title = ''
	})

	it('should track page view on mount', () => {
		renderHook(() => usePageTracking())

		expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
			page: 'Animals',
			path: '/animals',
			search: '?filter=active',
			timestamp: expect.any(String),
		})
	})

	it('should update document title', () => {
		renderHook(() => usePageTracking())

		expect(document.title).toBe('Animals - Cattle Farm Management System')
	})

	it('should use header title when page name not found', () => {
		mockLocation.pathname = '/unknown-page'

		renderHook(() => usePageTracking())

		expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
			page: mockHeaderTitle,
			path: '/unknown-page',
			search: '?filter=active',
			timestamp: expect.any(String),
		})

		expect(document.title).toBe(`${mockHeaderTitle} - Cattle Farm Management System`)
	})

	it('should handle root path correctly', () => {
		mockLocation.pathname = '/'

		renderHook(() => usePageTracking())

		expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
			page: 'Home',
			path: '/',
			search: '?filter=active',
			timestamp: expect.any(String),
		})
	})

	it('should track different page paths', () => {
		const testCases = [
			{ path: '/employees', expected: 'Employees' },
			{ path: '/tasks', expected: 'Tasks' },
			{ path: '/my-account', expected: 'My Account' },
			{ path: '/login', expected: 'Login' },
		]

		testCases.forEach(({ path, expected }) => {
			mockLocation.pathname = path
			mockTrackEvent.mockClear()

			renderHook(() => usePageTracking())

			expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
				page: expected,
				path,
				search: '?filter=active',
				timestamp: expect.any(String),
			})
		})
	})

	it('should re-track when location changes', () => {
		const { rerender } = renderHook(() => usePageTracking())

		expect(mockTrackEvent).toHaveBeenCalledTimes(1)

		// Simulate location change
		mockLocation.pathname = '/employees'
		rerender()

		expect(mockTrackEvent).toHaveBeenCalledTimes(2)
		expect(mockTrackEvent).toHaveBeenLastCalledWith('page_view', {
			page: 'Employees',
			path: '/employees',
			search: '?filter=active',
			timestamp: expect.any(String),
		})
	})

	it('should handle empty search params', () => {
		mockLocation.pathname = '/animals'
		mockLocation.search = ''

		renderHook(() => usePageTracking())

		expect(mockTrackEvent).toHaveBeenCalledWith('page_view', {
			page: 'Animals',
			path: '/animals',
			search: '',
			timestamp: expect.any(String),
		})
	})
})
