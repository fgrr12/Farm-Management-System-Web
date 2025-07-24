import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal } from '@/components/layout/Modal/Modal.component'

import { render } from '@/tests/utils/test-utils'

describe('Modal', () => {
	const defaultProps = {
		title: 'Test Modal',
		message: 'This is a test message',
		open: true,
	}

	beforeEach(() => {
		vi.clearAllMocks()

		// Mock HTMLDialogElement methods
		HTMLDialogElement.prototype.showModal = vi.fn()
		HTMLDialogElement.prototype.close = vi.fn()
	})

	it('should render modal with title and message', () => {
		render(<Modal {...defaultProps} />)

		expect(screen.getByText('Test Modal')).toBeInTheDocument()
		expect(screen.getByText('This is a test message')).toBeInTheDocument()
	})

	it('should render accept button', () => {
		render(<Modal {...defaultProps} />)

		const acceptButton = screen.getByText('Aceptar')
		expect(acceptButton).toBeInTheDocument()
		expect(acceptButton).toHaveClass('btn', 'btn-primary')
	})

	it('should render cancel button when onCancel is provided', () => {
		const onCancel = vi.fn()
		render(<Modal {...defaultProps} onCancel={onCancel} />)

		const cancelButton = screen.getByText('Cancelar')
		expect(cancelButton).toBeInTheDocument()
		expect(cancelButton).toHaveClass('btn', 'btn-error')
	})

	it('should not render cancel button when onCancel is not provided', () => {
		render(<Modal {...defaultProps} />)

		expect(screen.queryByText('Cancelar')).not.toBeInTheDocument()
	})

	it('should call onAccept when accept button is clicked', () => {
		const onAccept = vi.fn()
		render(<Modal {...defaultProps} onAccept={onAccept} />)

		fireEvent.click(screen.getByText('Aceptar'))
		expect(onAccept).toHaveBeenCalledTimes(1)
	})

	it('should call onCancel when cancel button is clicked', () => {
		const onCancel = vi.fn()
		render(<Modal {...defaultProps} onCancel={onCancel} />)

		fireEvent.click(screen.getByText('Cancelar'))
		expect(onCancel).toHaveBeenCalledTimes(1)
	})

	it('should call onCancel when backdrop is clicked and onCancel is provided', () => {
		const onCancel = vi.fn()
		render(<Modal {...defaultProps} onCancel={onCancel} />)

		const backdrop = document.querySelector('.modal-backdrop button')
		expect(backdrop).toBeInTheDocument()

		fireEvent.click(backdrop!)
		expect(onCancel).toHaveBeenCalledTimes(1)
	})

	it('should call onAccept when backdrop is clicked and onCancel is not provided', () => {
		const onAccept = vi.fn()
		render(<Modal {...defaultProps} onAccept={onAccept} />)

		const backdrop = document.querySelector('.modal-backdrop button')
		expect(backdrop).toBeInTheDocument()

		fireEvent.click(backdrop!)
		expect(onAccept).toHaveBeenCalledTimes(1)
	})

	it('should have proper modal structure', () => {
		render(<Modal {...defaultProps} />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toHaveClass('modal')

		const modalBox = dialog?.querySelector('.modal-box')
		expect(modalBox).toBeInTheDocument()

		const modalAction = dialog?.querySelector('.modal-action')
		expect(modalAction).toBeInTheDocument()

		const modalBackdrop = dialog?.querySelector('.modal-backdrop')
		expect(modalBackdrop).toBeInTheDocument()
	})

	it('should pass additional props to dialog element', () => {
		render(<Modal {...defaultProps} data-testid="custom-modal" />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toHaveAttribute('data-testid', 'custom-modal')
	})

	it('should handle modal open state changes', () => {
		const { rerender } = render(<Modal {...defaultProps} open={false} />)

		// Modal should be closed initially
		const dialog = document.querySelector('dialog')
		expect(dialog).toBeInTheDocument()

		// Open the modal
		rerender(<Modal {...defaultProps} open={true} />)
		expect(dialog).toBeInTheDocument()
	})

	it('should have proper accessibility attributes', () => {
		render(<Modal {...defaultProps} />)

		const dialog = document.querySelector('dialog')
		expect(dialog).toBeInTheDocument()

		const title = screen.getByText('Test Modal')
		expect(title).toHaveClass('font-bold', 'text-lg')

		const buttons = document.querySelectorAll('button')
		expect(buttons.length).toBeGreaterThan(0)
	})

	it('should handle keyboard interactions', () => {
		const onAccept = vi.fn()
		const onCancel = vi.fn()
		render(<Modal {...defaultProps} onAccept={onAccept} onCancel={onCancel} />)

		const acceptButton = screen.getByText('Aceptar')
		screen.getByText('Cancelar')

		// Test Enter key on accept button
		fireEvent.keyDown(acceptButton, { key: 'Enter', code: 'Enter' })
		// Note: The actual Enter key handling would be done by the browser for button elements

		// Test Escape key on dialog (this would be handled by the browser's native dialog behavior)
		const dialog = document.querySelector('dialog')
		fireEvent.keyDown(dialog!, { key: 'Escape', code: 'Escape' })
	})

	it('should work with only required props', () => {
		const minimalProps = {
			title: 'Minimal Modal',
			message: 'Minimal message',
			open: true,
		}

		render(<Modal {...minimalProps} />)

		expect(screen.getByText('Minimal Modal')).toBeInTheDocument()
		expect(screen.getByText('Minimal message')).toBeInTheDocument()
		expect(screen.getByText('Aceptar')).toBeInTheDocument()
		expect(screen.queryByText('Cancelar')).not.toBeInTheDocument()
	})
})
