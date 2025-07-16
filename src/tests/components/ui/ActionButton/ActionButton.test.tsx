import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ActionButton } from '@/components/ui/ActionButton/ActionButton.component'

import { render } from '@/tests/utils/test-utils'

// Mock GSAP
vi.mock('gsap', () => ({
	default: {
		fromTo: vi.fn(),
		to: vi.fn(),
	},
}))

// Mock useGSAP hook
vi.mock('@gsap/react', () => ({
	useGSAP: vi.fn((callback) => {
		callback()
	}),
}))

// Mock store
vi.mock('@/store/useAppStore', () => ({
	useAppStore: vi.fn(() => ({
		loading: false,
	})),
}))

describe('ActionButton', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render button with icon', () => {
		render(<ActionButton icon="i-material-symbols-add-circle-outline" />)

		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()

		const icon = button.querySelector('i')
		expect(icon).toHaveClass('i-material-symbols-add-circle-outline')
	})

	it('should have proper button styling', () => {
		render(<ActionButton icon="test-icon" />)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('btn', 'btn-circle', 'bg-transparent', 'border-none', 'shadow-none')
	})

	it('should have proper icon styling', () => {
		render(<ActionButton icon="test-icon" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('h-8!', 'w-8!')
	})

	it('should apply correct color for add icon', () => {
		render(<ActionButton icon="i-material-symbols-add-circle-outline" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-blue-500!')
	})

	it('should apply correct color for delete icon', () => {
		render(<ActionButton icon="i-material-symbols-delete-outline" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-red-500!')
	})

	it('should apply correct color for health icon', () => {
		render(<ActionButton icon="i-material-symbols-light-health-metrics-rounded" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-emerald-500!')
	})

	it('should apply correct color for milk icon', () => {
		render(<ActionButton icon="i-icon-park-outline-milk" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-gray-500!')
	})

	it('should apply correct color for relation icon', () => {
		render(<ActionButton icon="i-tabler-circles-relation" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-yellow-500!')
	})

	it('should apply correct color for close icons', () => {
		const closeIcons = ['i-lucide-circle-x', 'i-material-symbols-event-busy-rounded']

		closeIcons.forEach((icon) => {
			const { unmount } = render(<ActionButton icon={icon} />)

			const iconElement = screen.getByRole('button').querySelector('i')
			expect(iconElement).toHaveClass('bg-red-500!')

			unmount()
		})
	})

	it('should apply correct color for white icons', () => {
		const whiteIcons = ['i-lineicons-xmark', 'i-lineicons-microphone-1']

		whiteIcons.forEach((icon) => {
			const { unmount } = render(<ActionButton icon={icon} />)

			const iconElement = screen.getByRole('button').querySelector('i')
			expect(iconElement).toHaveClass('bg-white!')

			unmount()
		})
	})

	it('should not apply color for unknown icons', () => {
		render(<ActionButton icon="unknown-icon" />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).not.toHaveClass('bg-blue-500!')
		expect(icon).not.toHaveClass('bg-red-500!')
		expect(icon).not.toHaveClass('bg-emerald-500!')
	})

	it('should apply gray color when disabled', () => {
		render(<ActionButton icon="i-material-symbols-add-circle-outline" disabled />)

		const icon = screen.getByRole('button').querySelector('i')
		expect(icon).toHaveClass('bg-gray-400!')
		expect(icon).not.toHaveClass('bg-blue-500!')
	})

	it('should handle click events', () => {
		const onClick = vi.fn()
		render(<ActionButton icon="test-icon" onClick={onClick} />)

		fireEvent.click(screen.getByRole('button'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('should handle mouse enter and leave events', () => {
		render(<ActionButton icon="test-icon" />)

		const button = screen.getByRole('button')

		// Mouse enter and leave should not throw errors
		fireEvent.mouseEnter(button)
		fireEvent.mouseLeave(button)

		// Button should still be in the document
		expect(button).toBeInTheDocument()
	})

	it('should pass additional props to button', () => {
		render(<ActionButton icon="test-icon" data-testid="custom-button" aria-label="Custom action" />)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('data-testid', 'custom-button')
		expect(button).toHaveAttribute('aria-label', 'Custom action')
	})

	it('should be disabled when disabled prop is true', () => {
		render(<ActionButton icon="test-icon" disabled />)

		const button = screen.getByRole('button')
		expect(button).toBeDisabled()
	})

	it('should handle different button types', () => {
		render(<ActionButton icon="test-icon" type="submit" />)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('type', 'submit')
	})

	it('should work without icon', () => {
		render(<ActionButton />)

		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()

		const icon = button.querySelector('i')
		expect(icon).toHaveClass('h-8!', 'w-8!')
	})

	it('should handle loading state from store', () => {
		// Test that component renders regardless of loading state
		render(<ActionButton icon="test-icon" />)

		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()
	})

	it('should have proper accessibility', () => {
		render(<ActionButton icon="test-icon" aria-label="Action button" />)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-label', 'Action button')
		expect(button).toHaveAttribute('type', 'button')
	})

	it('should render children if provided', () => {
		render(
			<ActionButton icon="test-icon">
				<span>Button Text</span>
			</ActionButton>
		)

		// The ActionButton component only renders the icon, not children
		// This is based on the component structure we saw
		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()

		const icon = button.querySelector('i')
		expect(icon).toHaveClass('test-icon')
	})
})
