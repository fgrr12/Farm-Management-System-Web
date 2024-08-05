import {
	useEffect,
	useRef,
	useState,
	type ChangeEvent,
	type DragEvent,
	type MouseEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

// Types
import type { DropEvent, DropzoneProps } from './Dropzone.types'

// Styles
import * as S from './Dropzone.styles'

export const Dropzone: FC<DropzoneProps> = ({ cleanFile, pictureUrl, onFile, ...rest }) => {
	const { t } = useTranslation()
	const inputRef = useRef<HTMLInputElement>(null)
	const [labelText, setLabelText] = useState<string>(t('dropzone.nonDrag'))
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
			setLabelText(t('dropzone.selected'))
			setHasImg(true)
			setUrl(URL.createObjectURL(files[0]))
		} else {
			setLabelText(t('dropzone.invalid'))
		}
	}

	const handleDragEnter = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		setLabelText(t('dropzone.drag'))
	}

	const handleDragLeave = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		setLabelText(t('dropzone.nonDrag'))
	}

	const handleStopPropagation = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	const removeImage = () => {
		inputRef.current!.value = ''
		setLabelText(t('dropzone.nonDrag'))
		setHasImg(false)
		setUrl('')
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (cleanFile) {
			removeImage()
		}
	}, [cleanFile])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (pictureUrl) {
			setHasImg(true)
			setUrl(pictureUrl)
		}
	}, [])

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

const isImage = (file: File): boolean => {
	return file.type.startsWith('image/')
}

const getFileList = (event: DropEvent) => {
	if (event.type === 'drop') {
		return (event as DragEvent<HTMLInputElement>).dataTransfer.files
	}
	return (event as ChangeEvent<HTMLInputElement>).target.files!
}
