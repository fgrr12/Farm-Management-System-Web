import {
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
	type MouseEvent,
} from 'react'

// Types
import type { DropEvent, DropzoneProps } from './Dropzone.types'

// Styles
import * as S from './Dropzone.styles'

export const Dropzone: FC<DropzoneProps> = ({ onFile, cleanFile, ...rest }) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const [labelText, setLabelText] = useState<string>(DropzoneStates.NON_DRAG)
	const [url, setUrl] = useState<string>('')
	const [hasImg, setHasImg] = useState<boolean>(false)

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (!inputRef.current) return
		event.preventDefault()
		inputRef.current.click()
	}

	const handleDrop = (event: DropEvent) => {
		event.preventDefault()
		const files = getFileList(event)
		if (files.length && isImage(files[0])) {
			onFile(files[0], event)
			setLabelText(DropzoneStates.SELECTED)
			setHasImg(true)
			console.log(URL.createObjectURL(files[0]))

			setUrl(URL.createObjectURL(files[0]))
		} else {
			setLabelText(DropzoneStates.INVALID)
		}
	}

	const handleDragEnter = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		setLabelText(DropzoneStates.DRAG)
	}

	const handleDragLeave = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		setLabelText(DropzoneStates.NON_DRAG)
	}

	const handleStopPropagation = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	const removeImage = () => {
		inputRef.current!.value = ''
		setLabelText(DropzoneStates.NON_DRAG)
		setHasImg(false)
		setUrl('')
	}

	useEffect(() => {
		if (cleanFile) {
			removeImage()
		}
	}, [cleanFile, removeImage])

	return (
		<S.DropzoneContainer>
			{hasImg && (
				<S.RemoveIconContainer>
					<S.RemoveIcon className="i-material-symbols-close-rounded" onClick={removeImage} />
				</S.RemoveIconContainer>
			)}
			<S.Dropzone
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragEnter}
				onDragLeave={handleDragLeave}
			>
				{!hasImg && <S.Label>{labelText}</S.Label>}
				{!hasImg && <S.Icon className="i-mdi-file-upload" />}
				{hasImg && <S.Img src={url} alt="Imagen seleccionada" />}
				<S.DropzoneInput
					type="file"
					accept="image/*"
					ref={inputRef}
					onClick={handleStopPropagation}
					onChange={handleDrop}
					{...rest}
				/>
			</S.Dropzone>
		</S.DropzoneContainer>
	)
}

enum DropzoneStates {
	NON_DRAG = 'Suelta tu imagen aquí o haz click para seleccionarla',
	DRAG = 'Suelta tu imagen aquí',
	SELECTED = 'Imagen seleccionada:',
	INVALID = 'Solo se permiten imágenes',
}

const isImage = (file: File): boolean => {
	return file.type.startsWith('image/')
}

const getFileList = (event: DropEvent) => {
	if (event.type === 'drop') {
		return (event as DragEvent<HTMLInputElement>).dataTransfer.files
	}
	return (event as ChangeEvent<HTMLInputElement>).target.files!
}
