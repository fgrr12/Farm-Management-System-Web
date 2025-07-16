import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OfflineIndicator } from '@/components/layout/OfflineIndicator/OfflineIndicator.component'

import { render } from '@/tests/utils/test-utils'

// Mock the offline hook
vi.mock('@/hooks/useOffline', () => ({
	useOffline: vi.fn(),
}))

// Mock translations
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			const translations: Record<string, string> = {
				'offline.noConnection': 'No internet connection',
				'offline.pendingOperations': `${options?.count || 0} pending operation${options?.count !== 1 ? 's' : ''}`,
			}
			return translations[key] || key
		},
	}),
}))

describe('OfflineIndicator', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should not render when online and no pending operations', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: false,
			queueLength: 0,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		const { container } = render(<OfflineIndicator />)
		expect(container.firstChild).toBeNull()
	})

	it('should show offline indicator when offline', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 0,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		expect(screen.getByText('No internet connection')).toBeInTheDocument()

		const alertElement = screen.getByText('No internet connection').closest('.alert')
		expect(alertElement).toHaveClass('alert-warning')
	})

	it('should show pending operations indicator', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: false,
			queueLength: 3,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		expect(screen.getByText('3 pending operations')).toBeInTheDocument()

		const alertElement = screen.getByText('3 pending operations').closest('.alert')
		expect(alertElement).toHaveClass('alert-info')
	})

	it('should show both indicators when offline with pending operations', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 2,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		expect(screen.getByText('No internet connection')).toBeInTheDocument()
		expect(screen.getByText('2 pending operations')).toBeInTheDocument()

		const alerts = document.querySelectorAll('.alert')
		expect(alerts).toHaveLength(2)
	})

	it('should have proper styling and positioning', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 1,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		const container = document.querySelector('.fixed.bottom-4.right-4.z-50')
		expect(container).toBeInTheDocument()
	})

	it('should show appropriate icons', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 1,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		// Check for offline icon
		expect(document.querySelector('.i-material-symbols-wifi-off')).toBeInTheDocument()

		// Check for sync icon
		expect(document.querySelector('.i-material-symbols-sync')).toBeInTheDocument()
	})

	it('should have spinning animation on sync icon', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: false,
			queueLength: 1,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		const syncIcon = document.querySelector('.i-material-symbols-sync')
		expect(syncIcon).toHaveClass('animate-spin')
	})

	it('should handle different queue lengths', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		const testCases = [1, 5, 10, 99]

		for (const queueLength of testCases) {
			vi.mocked(useOffline).mockReturnValue({
				isOffline: false,
				queueLength,
				offlineQueue: [],
				addToOfflineQueue: vi.fn(),
				clearOfflineQueue: vi.fn(),
				processOfflineQueue: vi.fn(),
			})

			const { unmount } = render(<OfflineIndicator />)

			expect(
				screen.getByText(`${queueLength} pending operation${queueLength !== 1 ? 's' : ''}`)
			).toBeInTheDocument()

			unmount()
		}
	})

	it('should handle state changes correctly', async () => {
		const { useOffline } = await import('@/hooks/useOffline')

		// Start online with no queue
		vi.mocked(useOffline).mockReturnValue({
			isOffline: false,
			queueLength: 0,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		const { container, rerender } = render(<OfflineIndicator />)
		expect(container.firstChild).toBeNull()

		// Go offline
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 0,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		rerender(<OfflineIndicator />)
		expect(screen.getByText('No internet connection')).toBeInTheDocument()

		// Add pending operations
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 3,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		rerender(<OfflineIndicator />)
		expect(screen.getByText('No internet connection')).toBeInTheDocument()
		expect(screen.getByText('3 pending operations')).toBeInTheDocument()

		// Go back online but keep queue
		vi.mocked(useOffline).mockReturnValue({
			isOffline: false,
			queueLength: 3,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		rerender(<OfflineIndicator />)
		expect(screen.queryByText('No internet connection')).not.toBeInTheDocument()
		expect(screen.getByText('3 pending operations')).toBeInTheDocument()
	})

	it('should have accessible alert roles', async () => {
		const { useOffline } = await import('@/hooks/useOffline')
		vi.mocked(useOffline).mockReturnValue({
			isOffline: true,
			queueLength: 2,
			offlineQueue: [],
			addToOfflineQueue: vi.fn(),
			clearOfflineQueue: vi.fn(),
			processOfflineQueue: vi.fn(),
		})

		render(<OfflineIndicator />)

		const alerts = document.querySelectorAll('.alert')
		expect(alerts).toHaveLength(2)

		// Each alert should be accessible
		alerts.forEach((alert) => {
			expect(alert).toBeInTheDocument()
			expect(alert).toHaveClass('alert')
		})
	})
})
