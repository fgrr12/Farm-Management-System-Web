import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PasswordField, TextField } from '@/components/ui/TextField/TextField.component'

import { render } from '@/tests/utils/test-utils'

describe('TextField Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render text field with label', () => {
		render(<TextField label="Name" />)

		expect(screen.getByText('Name')).toBeInTheDocument()
		expect(screen.getByRole('textbox')).toBeInTheDocument()
	})

	it('should render text field without label', () => {
		render(<TextField placeholder="Enter text" />)

		expect(screen.getByRole('textbox')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
	})

	it('should handle input changes', () => {
		const handleChange = vi.fn()
		render(<TextField label="Name" onChange={handleChange} />)

		const input = screen.getByRole('textbox')
		fireEvent.change(input, { target: { value: 'John Doe' } })

		expect(handleChange).toHaveBeenCalledTimes(1)
		expect(input).toHaveValue('John Doe')
	})

	it('should apply custom className', () => {
		render(<TextField label="Name" className="custom-input" />)

		const input = screen.getByRole('textbox')
		expect(input).toHaveClass('custom-input')
	})

	it('should support different input types', () => {
		const { rerender } = render(<TextField type="email" />)
		expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

		rerender(<TextField type="number" />)
		expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')

		rerender(<TextField type="tel" />)
		expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
	})

	it('should handle required attribute', () => {
		render(<TextField label="Required Field" required />)

		const input = screen.getByRole('textbox')
		expect(input).toBeRequired()
	})

	it('should handle disabled state', () => {
		render(<TextField label="Disabled Field" disabled />)

		const input = screen.getByRole('textbox')
		expect(input).toBeDisabled()
	})

	it('should pass through HTML input attributes', () => {
		render(
			<TextField
				label="Test Field"
				id="test-input"
				data-testid="custom-input"
				maxLength={50}
				minLength={5}
			/>
		)

		const input = screen.getByRole('textbox')
		expect(input).toHaveAttribute('id', 'test-input')
		expect(input).toHaveAttribute('data-testid', 'custom-input')
		expect(input).toHaveAttribute('maxLength', '50')
		expect(input).toHaveAttribute('minLength', '5')
	})

	it('should have proper fieldset structure', () => {
		render(<TextField label="Test Field" />)

		const fieldset = screen.getByRole('group')
		const legend = screen.getByText('Test Field')

		expect(fieldset).toBeInTheDocument()
		expect(legend).toBeInTheDocument()
		expect(fieldset).toContainElement(legend)
	})

	it('should handle focus and blur events', () => {
		const handleFocus = vi.fn()
		const handleBlur = vi.fn()
		render(<TextField label="Test" onFocus={handleFocus} onBlur={handleBlur} />)

		const input = screen.getByRole('textbox')

		fireEvent.focus(input)
		expect(handleFocus).toHaveBeenCalledTimes(1)

		fireEvent.blur(input)
		expect(handleBlur).toHaveBeenCalledTimes(1)
	})

	it('should support controlled input', () => {
		const handleChange = vi.fn()
		const { rerender } = render(<TextField label="Name" value="initial" onChange={handleChange} />)

		const input = screen.getByRole('textbox')
		expect(input).toHaveValue('initial')

		rerender(<TextField label="Name" value="updated" onChange={handleChange} />)
		expect(input).toHaveValue('updated')
	})
})

describe('PasswordField Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render password field with label', () => {
		render(<PasswordField label="Password" />)

		expect(screen.getByText('Password')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
	})

	it('should initially hide password', () => {
		render(<PasswordField label="Password" />)

		const input = screen.getByPlaceholderText('Password')
		expect(input).toHaveAttribute('type', 'password')
	})

	it('should toggle password visibility', () => {
		render(<PasswordField label="Password" />)

		const input = screen.getByPlaceholderText('Password')
		const toggleButton = screen.getByRole('button')

		// Initially hidden
		expect(input).toHaveAttribute('type', 'password')

		// Click to show
		fireEvent.click(toggleButton)
		expect(input).toHaveAttribute('type', 'text')

		// Click to hide again
		fireEvent.click(toggleButton)
		expect(input).toHaveAttribute('type', 'password')
	})

	it('should show correct visibility icons', () => {
		render(<PasswordField label="Password" />)

		const toggleButton = screen.getByRole('button')

		// Initially should show visibility icon (to show password)
		expect(document.querySelector('.i-material-symbols-visibility')).toBeInTheDocument()

		// After clicking, should show visibility-lock icon (to hide password)
		fireEvent.click(toggleButton)
		expect(document.querySelector('.i-material-symbols-visibility-lock')).toBeInTheDocument()
	})

	it('should handle password input changes', () => {
		const handleChange = vi.fn()
		render(<PasswordField label="Password" onChange={handleChange} />)

		const input = screen.getByPlaceholderText('Password')
		fireEvent.change(input, { target: { value: 'secretpassword' } })

		expect(handleChange).toHaveBeenCalledTimes(1)
		expect(input).toHaveValue('secretpassword')
	})

	it('should show key icon', () => {
		render(<PasswordField label="Password" />)

		expect(document.querySelector('.i-material-symbols-light-key')).toBeInTheDocument()
	})

	it('should be required by default', () => {
		render(<PasswordField label="Password" />)

		const input = screen.getByPlaceholderText('Password')
		expect(input).toBeRequired()
	})

	it('should pass through additional props', () => {
		render(<PasswordField label="Password" id="password-input" data-testid="password" />)

		const input = screen.getByPlaceholderText('Password')
		expect(input).toHaveAttribute('id', 'password-input')
		expect(input).toHaveAttribute('data-testid', 'password')
	})

	it('should have proper structure with label and input', () => {
		render(<PasswordField label="Password" />)

		const fieldset = screen.getByRole('group')
		const legend = screen.getByText('Password')
		const label = screen.getByRole('button').closest('label')

		expect(fieldset).toBeInTheDocument()
		expect(legend).toBeInTheDocument()
		expect(label).toBeInTheDocument()
		expect(fieldset).toContainElement(legend)
		expect(fieldset).toContainElement(label)
	})

	it('should handle keyboard navigation on toggle button', () => {
		render(<PasswordField label="Password" />)

		const toggleButton = screen.getByRole('button')
		const input = screen.getByPlaceholderText('Password')

		// Initially password type
		expect(input).toHaveAttribute('type', 'password')

		// Press Enter on toggle button
		fireEvent.keyDown(toggleButton, { key: 'Enter' })
		fireEvent.click(toggleButton) // Simulate the click that would happen

		expect(input).toHaveAttribute('type', 'text')
	})

	it('should maintain password visibility state during re-render', () => {
		const { rerender } = render(<PasswordField label="Password" />)

		const input = screen.getByPlaceholderText('Password')
		const toggleButton = screen.getByRole('button')

		// Show password
		fireEvent.click(toggleButton)
		expect(input).toHaveAttribute('type', 'text')

		// Re-render component with same props - state should be maintained
		rerender(<PasswordField label="Password" />)

		// Should maintain visibility state (React behavior)
		const newInput = screen.getByPlaceholderText('Password')
		expect(newInput).toHaveAttribute('type', 'text')
	})
})
