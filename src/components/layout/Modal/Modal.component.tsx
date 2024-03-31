import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import type { ModalProps } from './Modal.types'
import * as S from './Modal.styles'

export const Modal: FC<ModalProps> = ({ title, message, open, onAccept, onCancel, ...rest }) => {
	const { modalRef } = useModal(open)

	return (
		<S.ModalDialog ref={modalRef} {...rest}>
			<S.Modal>
				<S.ModalHeader>
					<h2>{title}</h2>
				</S.ModalHeader>
				<S.ModalSection>
					<p>{message}</p>
				</S.ModalSection>
				<S.ButtonsSection>
					<Button onClick={onAccept}>Aceptar</Button>
					{onCancel && <Button onClick={onCancel}>Cancelar</Button>}
				</S.ButtonsSection>
			</S.Modal>
		</S.ModalDialog>
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
