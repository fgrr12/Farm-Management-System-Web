import type { FC } from 'react'
import { useEffect, useRef } from 'react'

import type { ModalProps } from './Modal.types'

export const Modal: FC<ModalProps> = ({ title, message, open, onAccept, onCancel, ...rest }) => {
	const { modalRef } = useModal(open)

	return (
		<dialog className="modal" ref={modalRef} aria-modal="true" {...rest}>
			<div className="modal-box">
				<h3 className="font-bold text-lg" id="modal-title">{title}</h3>
				<p className="py-4" id="modal-description">{message}</p>
				<div className="modal-action">
					<form method="dialog">
						<button type="button" className="btn btn-primary mr-4" onClick={onAccept}>
							Aceptar
						</button>
						{onCancel && (
							<button type="button" className="btn btn-error" onClick={onCancel}>
								Cancelar
							</button>
						)}
					</form>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onCancel ? onCancel : onAccept} aria-label="Close modal" />
			</form>
		</dialog>
	)
}

const useModal = (open?: boolean) => {
	const modalRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		if (!modalRef.current) return
		open ? modalRef.current.showModal() : modalRef.current.close()
	}, [open])

	return { modalRef }
}
