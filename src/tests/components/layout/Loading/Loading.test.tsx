import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Loading } from '@/components/layout/Loading/Loading.component'

import { render } from '@/tests/utils/test-utils'

// Mock GSAP
vi.mock('gsap', () => ({
	default: {
		to: vi.fn(),
	},
}))

// Mock translations
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				loading: 'Cargando',
			}
			return translations[key] || key
		},
	}),
}))

describe('Loading', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Mock HTMLDialogElement methods
		HTMLDialogElement.prototype.showModal = vi.fn()
		HTMLDialogElement.prototype.close = vi.fn()
	})

	it('should render loading text', () => {
		render(<Loading open={true} />)

		expect(screen.getByText('Cargando')).toBeInTheDocument()
	})

	it('should render loading dots', () => {
		render(<Loading open={true} />)

		const dots = screen.getAllByText('.')
		expect(dots).toHaveLength(3)
	})

	it('should render animal icons', () => {
		render(<Loading open={true} />)

		const dialog = document.querySelector('dialog')
		const icons = dialog!.querySelectorAll('i')

		expect(icons).toHaveLength(4)
		expect(icons[0]).toHaveClass('i-fluent-emoji-flat-cow')
		expect(icons[1]).toHaveClass('i-emojione-chicken')
		expect(icons[2]).toHaveClass('i-fxemoji-sheep')
		expect(icons[3]).toHaveClass('i-emojione-goat')
	})

	it('should render backdrop when open', () => {
		render(<Loading open={true} />)

		const backdrop = document.querySelector('.fixed.inset-0.z-40')
		expect(backdrop).toBeInTheDocument()
		expect(backdrop).toHaveClass('backdrop-blur-md', 'bg-black/30')
	})

	it('should not render backdrop when closed', () => {
		render(<Loading open={false} />)

		const backdrop = document.querySelector('.fixed.inset-0.z-40')
		expect(backdrop).not.toBeInTheDocument()
	})

	it('should have proper dialog styling', () => {
		render(<Loading open={true} />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toHaveClass(
			'fixed',
			'top-1/2',
			'left-1/2',
			'-translate-x-1/2',
			'-translate-y-1/2',
			'border-none',
			'bg-transparent',
			'outline-none',
			'overflow-hidden',
			'z-50'
		)
	})

	it('should have proper text styling', () => {
		render(<Loading open={true} />)

		const loadingText = screen.getByText('Cargando')
		expect(loadingText).toHaveClass('text-white', 'text-4xl', 'mx-1')

		const dots = screen.getAllByText('.')
		dots.forEach((dot) => {
			expect(dot).toHaveClass('text-white', 'text-5xl', 'mx-1')
		})
	})

	it('should have proper icon styling', () => {
		render(<Loading open={true} />)

		const dialog = document.querySelector('dialog')
		const icons = dialog!.querySelectorAll('i')

		icons.forEach((icon) => {
			expect(icon).toHaveClass('w-12!', 'h-12!', 'mx-2')
		})
	})

	it('should have proper container styling', () => {
		render(<Loading open={true} />)

		const dialog = document.querySelector('dialog')

		// Check text container
		const textContainer = dialog!.querySelector('.flex.justify-center.items-center.h-10')
		expect(textContainer).toBeInTheDocument()
		expect(textContainer).toHaveClass('mb-8!')

		// Check icons container
		const iconsContainer = dialog!.querySelector('.flex.justify-center.items-center.w-screen')
		expect(iconsContainer).toBeInTheDocument()
	})

	it('should handle open state changes', () => {
		const { rerender } = render(<Loading open={false} />)

		// Should render dialog even when closed
		expect(document.querySelector('dialog')).toBeInTheDocument()
		expect(document.querySelector('.fixed.inset-0.z-40')).not.toBeInTheDocument()

		// Open the loading
		rerender(<Loading open={true} />)
		expect(document.querySelector('dialog')).toBeInTheDocument()
		expect(document.querySelector('.fixed.inset-0.z-40')).toBeInTheDocument()
	})

	it('should pass additional props to dialog', () => {
		render(<Loading open={true} data-testid="custom-loading" />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toHaveAttribute('data-testid', 'custom-loading')
	})

	it('should have proper accessibility attributes', () => {
		render(<Loading open={true} />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toBeInTheDocument()

		const backdrop = document.querySelector('.fixed.inset-0.z-40')
		expect(backdrop).toHaveAttribute('aria-hidden', 'true')
	})

	it('should work without open prop', () => {
		render(<Loading />)

		expect(document.querySelector('dialog')).toBeInTheDocument()
		expect(screen.getByText('Cargando')).toBeInTheDocument()
		expect(document.querySelector('.fixed.inset-0.z-40')).not.toBeInTheDocument()
	})

	it('should handle GSAP animations setup', () => {
		render(<Loading open={true} />)

		// Should render without errors and show loading elements
		expect(screen.getByText('Cargando')).toBeInTheDocument()
		expect(document.querySelector('dialog')).toBeInTheDocument()
	})

	it('should maintain proper z-index layering', () => {
		render(<Loading open={true} />)

		const backdrop = document.querySelector('.fixed.inset-0.z-40')
		const dialog = document.querySelector('dialog')

		expect(backdrop).toHaveClass('z-40')
		expect(dialog).toHaveClass('z-50')
	})
})
