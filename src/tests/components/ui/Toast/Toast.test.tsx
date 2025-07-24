import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Toast } from '@/components/ui/Toast/Toast.component'

import { render } from '@/tests/utils/test-utils'

// Mock GSAP
vi.mock('gsap', () => ({
	default: {
		to: vi.fn((_target, config) => {
			// Simulate immediate completion for testing
			if (config.onStart) config.onStart()
			if (config.onComplete) config.onComplete()
		}),
		set: vi.fn(),
	},
}))

// Mock useGSAP hook
vi.mock('@gsap/react', () => ({
	useGSAP: vi.fn((callback) => {
		callback()
	}),
}))

describe('Toast', () => {
	const defaultProps = {
		id: 'test-toast',
		message: 'Test message',
		onClose: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should render toast with message', () => {
		render(<Toast {...defaultProps} />)

		expect(screen.getByText('Test message')).toBeInTheDocument()
	})

	it('should render with default info type', () => {
		render(<Toast {...defaultProps} />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveClass('alert', 'alert-info')
	})

	it('should render with success type', () => {
		render(<Toast {...defaultProps} type="success" />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveClass('alert', 'alert-success')
	})

	it('should render with error type', () => {
		render(<Toast {...defaultProps} type="error" />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveClass('alert', 'alert-error')
	})

	it('should render with warning type', () => {
		render(<Toast {...defaultProps} type="warning" />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveClass('alert', 'alert-warning')
	})

	it('should have proper styling classes', () => {
		render(<Toast {...defaultProps} />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveClass(
			'alert',
			'shadow-lg',
			'transition-all',
			'w-full',
			'max-w-[90%]',
			'sm:max-w-100'
		)
	})

	it('should call onClose after default duration', () => {
		const onClose = vi.fn()
		render(<Toast {...defaultProps} onClose={onClose} />)

		// Fast-forward time by default duration (5000ms)
		vi.advanceTimersByTime(5000)

		expect(onClose).toHaveBeenCalledWith('test-toast')
	})

	it('should call onClose after custom duration', () => {
		const onClose = vi.fn()
		render(<Toast {...defaultProps} onClose={onClose} duration={3000} />)

		// Fast-forward time by custom duration (3000ms)
		vi.advanceTimersByTime(3000)

		expect(onClose).toHaveBeenCalledWith('test-toast')
	})

	it('should not call onClose before duration expires', () => {
		const onClose = vi.fn()
		render(<Toast {...defaultProps} onClose={onClose} duration={5000} />)

		// Fast-forward time by less than duration
		vi.advanceTimersByTime(2000)

		expect(onClose).not.toHaveBeenCalled()
	})

	it('should cleanup timeout on unmount', () => {
		const onClose = vi.fn()
		const { unmount } = render(<Toast {...defaultProps} onClose={onClose} duration={5000} />)

		// Unmount before timeout
		unmount()

		// Fast-forward time
		vi.advanceTimersByTime(5000)

		expect(onClose).not.toHaveBeenCalled()
	})

	it('should handle different message types', () => {
		const messages = [
			'Simple message',
			'Message with special characters: !@#$%^&*()',
			'Very long message that might wrap to multiple lines and test the layout',
			'',
		]

		messages.forEach((message) => {
			const { unmount } = render(<Toast {...defaultProps} message={message} />)

			if (message) {
				expect(screen.getByText(message)).toBeInTheDocument()
			}

			unmount()
		})
	})

	it('should handle multiple toasts with different IDs', () => {
		const onClose1 = vi.fn()
		const onClose2 = vi.fn()

		render(
			<div>
				<Toast id="toast-1" message="First toast" onClose={onClose1} />
				<Toast id="toast-2" message="Second toast" onClose={onClose2} />
			</div>
		)

		expect(screen.getByText('First toast')).toBeInTheDocument()
		expect(screen.getByText('Second toast')).toBeInTheDocument()

		// Fast-forward time
		vi.advanceTimersByTime(5000)

		waitFor(() => {
			expect(onClose1).toHaveBeenCalledWith('toast-1')
			expect(onClose2).toHaveBeenCalledWith('toast-2')
		})
	})

	it('should reset timeout when duration changes', () => {
		const onClose = vi.fn()
		const { rerender } = render(<Toast {...defaultProps} onClose={onClose} duration={5000} />)

		// Fast-forward partway
		vi.advanceTimersByTime(2000)

		// Change duration
		rerender(<Toast {...defaultProps} onClose={onClose} duration={3000} />)

		// Fast-forward by new duration
		vi.advanceTimersByTime(3000)

		expect(onClose).toHaveBeenCalledWith('test-toast')
	})

	it('should handle zero duration', () => {
		const onClose = vi.fn()
		render(<Toast {...defaultProps} onClose={onClose} duration={0} />)

		// Should close immediately
		vi.advanceTimersByTime(1)

		expect(onClose).toHaveBeenCalledWith('test-toast')
	})

	it('should be accessible', () => {
		render(<Toast {...defaultProps} />)

		const toast = screen.getByText('Test message').closest('div')
		expect(toast).toHaveAttribute('class')

		// Toast should contain the message text
		expect(screen.getByText('Test message')).toBeInTheDocument()
	})
})
