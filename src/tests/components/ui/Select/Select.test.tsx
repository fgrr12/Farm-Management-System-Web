import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Select } from '@/components/ui/Select/Select.component'

import { render } from '@/tests/utils/test-utils'

// Mock translations
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'select.default': 'Select an option',
			}
			return translations[key] || key
		},
	}),
}))

// Mock ActionButton
vi.mock('@/components/ui/ActionButton', () => ({
	ActionButton: ({ title, icon, onClick, disabled }: any) => (
		<button
			type="button"
			title={title}
			onClick={onClick}
			disabled={disabled}
			data-testid="clear-button"
		>
			<i className={icon} />
		</button>
	),
}))

describe('Select Component', () => {
	const mockItems = [
		{ value: 'option1', name: 'Option 1' },
		{ value: 'option2', name: 'Option 2' },
		{ value: 'option3', name: 'Option 3' },
	]

	const defaultProps = {
		items: mockItems,
		legend: 'Select an option',
		value: '',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render select with legend and options', () => {
		render(<Select {...defaultProps} />)

		// Check legend specifically
		const legend = screen.getByRole('group').querySelector('legend')
		expect(legend).toHaveTextContent('Select an option')

		expect(screen.getByRole('combobox')).toBeInTheDocument()
		expect(screen.getByText('Option 1')).toBeInTheDocument()
		expect(screen.getByText('Option 2')).toBeInTheDocument()
		expect(screen.getByText('Option 3')).toBeInTheDocument()
	})

	it('should show default placeholder when no value selected', () => {
		render(<Select {...defaultProps} />)

		// Check the option element specifically
		const defaultOption = screen.getByRole('combobox').querySelector('option[value=""]')
		expect(defaultOption).toHaveTextContent('Select an option')

		// Check that the select has no value selected (empty value)
		const select = screen.getByRole('combobox')
		expect(select).toHaveValue('')
	})

	it('should show custom default label', () => {
		render(<Select {...defaultProps} defaultLabel="Choose one" />)

		expect(screen.getByText('Choose one')).toBeInTheDocument()
	})

	it('should handle value selection', () => {
		const handleChange = vi.fn()
		render(<Select {...defaultProps} onChange={handleChange} />)

		const select = screen.getByRole('combobox')
		fireEvent.change(select, { target: { value: 'option2' } })

		expect(handleChange).toHaveBeenCalledTimes(1)
	})

	it('should display selected value', () => {
		render(<Select {...defaultProps} value="option2" />)

		const select = screen.getByRole('combobox')
		expect(select).toHaveValue('option2')
	})

	it('should show dropdown arrow when no value selected', () => {
		render(<Select {...defaultProps} />)

		const arrow = document.querySelector('.i-ic-outline-arrow-drop-down')
		expect(arrow).toBeInTheDocument()
		expect(arrow).toHaveClass('w-8!', 'h-8!')
	})

	it('should show clear button when value is selected', () => {
		render(<Select {...defaultProps} value="option1" />)

		const clearButton = screen.getByTestId('clear-button')
		expect(clearButton).toBeInTheDocument()
		expect(clearButton).toHaveAttribute('title', 'Clear')
	})

	it('should clear selection when clear button is clicked', () => {
		const handleChange = vi.fn()
		render(<Select {...defaultProps} value="option1" onChange={handleChange} />)

		const clearButton = screen.getByTestId('clear-button')
		fireEvent.click(clearButton)

		expect(handleChange).toHaveBeenCalled()
	})

	it('should use custom option value and label keys', () => {
		const customItems = [
			{ id: 'item1', title: 'Item 1' },
			{ id: 'item2', title: 'Item 2' },
		]

		render(
			<Select
				items={customItems}
				legend="Custom Select"
				value=""
				optionValue="id"
				optionLabel="title"
			/>
		)

		expect(screen.getByText('Item 1')).toBeInTheDocument()
		expect(screen.getByText('Item 2')).toBeInTheDocument()

		const options = screen.getAllByRole('option')
		// Check that we have the custom options (may or may not include default)
		expect(options.length).toBeGreaterThanOrEqual(2)

		// Find options by their values
		const option1 = options.find((option) => option.getAttribute('value') === 'item1')
		const option2 = options.find((option) => option.getAttribute('value') === 'item2')

		expect(option1).toBeInTheDocument()
		expect(option2).toBeInTheDocument()
	})

	it('should handle disabled state', () => {
		render(<Select {...defaultProps} disabled />)

		const select = screen.getByRole('combobox')
		expect(select).toBeDisabled()
	})

	it('should disable clear button when select is disabled', () => {
		render(<Select {...defaultProps} value="option1" disabled />)

		const clearButton = screen.getByTestId('clear-button')
		expect(clearButton).toBeDisabled()
	})

	it('should pass through additional props', () => {
		render(
			<Select
				{...defaultProps}
				id="custom-select"
				data-testid="test-select"
				name="testSelect"
				required
			/>
		)

		const select = screen.getByRole('combobox')
		expect(select).toHaveAttribute('id', 'custom-select')
		expect(select).toHaveAttribute('data-testid', 'test-select')
		expect(select).toHaveAttribute('name', 'testSelect')
		expect(select).toBeRequired()
	})

	it('should have proper fieldset structure', () => {
		render(<Select {...defaultProps} />)

		const fieldset = screen.getByRole('group')
		const legend = fieldset.querySelector('legend')
		const select = screen.getByRole('combobox')

		expect(fieldset).toBeInTheDocument()
		expect(legend).toBeInTheDocument()
		expect(legend).toHaveTextContent('Select an option')
		expect(fieldset).toContainElement(legend)
		expect(fieldset).toContainElement(select)
	})

	it('should handle empty items array', () => {
		render(<Select items={[]} legend="Empty Select" value="" />)

		const select = screen.getByRole('combobox')

		expect(select).toBeInTheDocument()

		// Check that only the default option exists
		const defaultOption = select.querySelector('option[value=""]')
		expect(defaultOption).toBeInTheDocument()
		expect(defaultOption).toHaveTextContent('Select an option')

		// Verify no other options exist
		const allOptions = select.querySelectorAll('option')
		expect(allOptions).toHaveLength(1)
	})

	it('should stop propagation on clear button click', () => {
		const handleChange = vi.fn()
		const handleClick = vi.fn()

		render(
			<div onClick={handleClick} role="button" tabIndex={0} onKeyDown={() => {}}>
				<Select {...defaultProps} value="option1" onChange={handleChange} />
			</div>
		)

		const clearButton = screen.getByTestId('clear-button')
		fireEvent.click(clearButton)

		expect(handleChange).toHaveBeenCalled()
		expect(handleClick).not.toHaveBeenCalled()
	})

	it('should have correct CSS classes', () => {
		render(<Select {...defaultProps} />)

		const fieldset = screen.getByRole('group')
		const legend = fieldset.querySelector('legend')
		const select = screen.getByRole('combobox')

		expect(fieldset).toHaveClass('fieldset', 'w-full')
		expect(legend).toHaveClass('fieldset-legend')
		expect(select).toHaveClass('input', 'w-full', 'h-12', 'validator', 'cursor-pointer')
	})

	it('should handle focus and blur events', () => {
		const handleFocus = vi.fn()
		const handleBlur = vi.fn()

		render(<Select {...defaultProps} onFocus={handleFocus} onBlur={handleBlur} />)

		const select = screen.getByRole('combobox')

		fireEvent.focus(select)
		expect(handleFocus).toHaveBeenCalledTimes(1)

		fireEvent.blur(select)
		expect(handleBlur).toHaveBeenCalledTimes(1)
	})
})
