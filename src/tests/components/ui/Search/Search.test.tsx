import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Search } from '@/components/ui/Search/Search.component'

import { render } from '@/tests/utils/test-utils'

describe('Search Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render search input with placeholder', () => {
		render(<Search placeholder="Search animals" />)

		expect(screen.getByPlaceholderText('Search animals')).toBeInTheDocument()
		expect(screen.getByText('Search animals')).toBeInTheDocument() // Legend
	})

	it('should handle input changes', () => {
		const handleChange = vi.fn()
		render(<Search placeholder="Search" onChange={handleChange} />)

		const input = screen.getByRole('searchbox')
		fireEvent.change(input, { target: { value: 'test query' } })

		expect(handleChange).toHaveBeenCalledTimes(1)
		expect(input).toHaveValue('test query')
	})

	it('should have search input type', () => {
		render(<Search placeholder="Search" />)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveAttribute('type', 'search')
	})

	it('should have autocomplete disabled', () => {
		render(<Search placeholder="Search" />)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveAttribute('autoComplete', 'off')
	})

	it('should display search icon', () => {
		render(<Search placeholder="Search" />)

		const icon = document.querySelector('.i-ph-magnifying-glass-duotone')
		expect(icon).toBeInTheDocument()
		expect(icon).toHaveClass('h-6!', 'w-6!', 'opacity-50')
	})

	it('should pass through additional props', () => {
		render(
			<Search
				placeholder="Search"
				id="search-input"
				data-testid="search-field"
				value="initial value"
				disabled
			/>
		)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveAttribute('id', 'search-input')
		expect(input).toHaveAttribute('data-testid', 'search-field')
		expect(input).toHaveValue('initial value')
		expect(input).toBeDisabled()
	})

	it('should handle focus and blur events', () => {
		const handleFocus = vi.fn()
		const handleBlur = vi.fn()
		render(<Search placeholder="Search" onFocus={handleFocus} onBlur={handleBlur} />)

		const input = screen.getByRole('searchbox')

		fireEvent.focus(input)
		expect(handleFocus).toHaveBeenCalledTimes(1)

		fireEvent.blur(input)
		expect(handleBlur).toHaveBeenCalledTimes(1)
	})

	it('should handle keyboard events', () => {
		const handleKeyDown = vi.fn()
		const handleKeyUp = vi.fn()
		render(<Search placeholder="Search" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />)

		const input = screen.getByRole('searchbox')

		fireEvent.keyDown(input, { key: 'Enter' })
		expect(handleKeyDown).toHaveBeenCalledTimes(1)

		fireEvent.keyUp(input, { key: 'Enter' })
		expect(handleKeyUp).toHaveBeenCalledTimes(1)
	})

	it('should have proper fieldset structure', () => {
		render(<Search placeholder="Search animals" />)

		const fieldset = screen.getByRole('group')
		const legend = screen.getByText('Search animals')
		const label = screen.getByRole('searchbox').closest('label')

		expect(fieldset).toBeInTheDocument()
		expect(legend).toBeInTheDocument()
		expect(label).toBeInTheDocument()
		expect(fieldset).toContainElement(legend)
		expect(fieldset).toContainElement(label)
	})

	it('should have correct CSS classes', () => {
		render(<Search placeholder="Search" />)

		const fieldset = screen.getByRole('group')
		const legend = screen.getByText('Search')
		const label = screen.getByRole('searchbox').closest('label')
		const input = screen.getByRole('searchbox')

		expect(fieldset).toHaveClass('fieldset', 'w-full')
		expect(legend).toHaveClass('fieldset-legend')
		expect(label).toHaveClass('input', 'p-2', 'w-full', 'h-12', 'rounded-md')
		expect(input).toHaveClass('grow')
	})

	it('should handle empty placeholder', () => {
		render(<Search placeholder="" />)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveAttribute('placeholder', '')
	})

	it('should handle controlled input', () => {
		const handleChange = vi.fn()
		const { rerender } = render(
			<Search placeholder="Search" value="test" onChange={handleChange} />
		)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveValue('test')

		rerender(<Search placeholder="Search" value="updated" onChange={handleChange} />)
		expect(input).toHaveValue('updated')
	})

	it('should handle uncontrolled input', () => {
		render(<Search placeholder="Search" />)

		const input = screen.getByRole('searchbox')
		fireEvent.change(input, { target: { value: 'user input' } })

		expect(input).toHaveValue('user input')
	})

	it('should support form integration', () => {
		render(
			<form data-testid="search-form">
				<Search placeholder="Search" name="query" required />
			</form>
		)

		const input = screen.getByRole('searchbox')
		expect(input).toHaveAttribute('name', 'query')
		expect(input).toBeRequired()
	})
})
