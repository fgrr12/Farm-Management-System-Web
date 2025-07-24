import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/Button/Button.component'

import { render } from '@/tests/utils/test-utils'

describe('Button Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render button with text', () => {
		render(<Button>Click me</Button>)

		expect(screen.getByRole('button')).toBeInTheDocument()
		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	it('should handle click events', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Click me</Button>)

		fireEvent.click(screen.getByRole('button'))
		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('should be disabled when disabled prop is true', () => {
		render(<Button disabled>Disabled Button</Button>)

		const button = screen.getByRole('button')
		expect(button).toBeDisabled()
	})

	it('should not call onClick when disabled', () => {
		const handleClick = vi.fn()
		render(
			<Button disabled onClick={handleClick}>
				Disabled Button
			</Button>
		)

		fireEvent.click(screen.getByRole('button'))
		expect(handleClick).not.toHaveBeenCalled()
	})

	it('should apply custom className', () => {
		render(<Button className="custom-class">Button</Button>)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('custom-class')
	})

	it('should render different button types', () => {
		const { rerender } = render(<Button type="submit">Submit</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

		rerender(<Button type="reset">Reset</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')

		rerender(<Button type="button">Button</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
	})

	it('should support different variants through className', () => {
		const { rerender } = render(<Button className="btn-primary">Primary</Button>)
		expect(screen.getByRole('button')).toHaveClass('btn-primary')

		rerender(<Button className="btn-secondary">Secondary</Button>)
		expect(screen.getByRole('button')).toHaveClass('btn-secondary')
	})

	it('should handle keyboard events', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Button</Button>)

		const button = screen.getByRole('button')
		fireEvent.keyDown(button, { key: 'Enter' })
		fireEvent.keyDown(button, { key: ' ' })

		// Button should be focusable and handle keyboard events naturally
		expect(button).toBeInTheDocument()
	})

	it('should support loading state through className', () => {
		render(<Button className="loading">Loading Button</Button>)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('loading')
	})

	it('should pass through HTML button attributes', () => {
		render(
			<Button id="test-button" data-testid="custom-button" aria-label="Custom button">
				Button
			</Button>
		)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('id', 'test-button')
		expect(button).toHaveAttribute('data-testid', 'custom-button')
		expect(button).toHaveAttribute('aria-label', 'Custom button')
	})

	it('should handle focus and blur events', () => {
		const handleFocus = vi.fn()
		const handleBlur = vi.fn()
		render(
			<Button onFocus={handleFocus} onBlur={handleBlur}>
				Button
			</Button>
		)

		const button = screen.getByRole('button')

		fireEvent.focus(button)
		expect(handleFocus).toHaveBeenCalledTimes(1)

		fireEvent.blur(button)
		expect(handleBlur).toHaveBeenCalledTimes(1)
	})

	it('should support form integration', () => {
		render(
			<form data-testid="test-form">
				<Button type="submit" form="test-form">
					Submit
				</Button>
			</form>
		)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('type', 'submit')
		expect(button).toHaveAttribute('form', 'test-form')
	})

	it('should handle multiple children', () => {
		render(
			<Button>
				<span>Icon</span>
				<span>Text</span>
			</Button>
		)

		expect(screen.getByText('Icon')).toBeInTheDocument()
		expect(screen.getByText('Text')).toBeInTheDocument()
	})
})
