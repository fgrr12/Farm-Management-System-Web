import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { type ChangeEvent, type FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { DropzoneProps } from './Dropzone.types'

export const Dropzone: FC<DropzoneProps> = ({ cleanFile, pictureUrl, onFile, ...rest }) => {
	const { t } = useTranslation(['dropzone'])
	const inputRef = useRef<HTMLInputElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const [labelText, setLabelText] = useState<string>()
	const [url, setUrl] = useState<string>('')
	const [hasImg, setHasImg] = useState<boolean>(false)

	useEffect(() => {
		if (!containerRef.current) return

		const el = containerRef.current

		const handleDrop = (e: DragEvent) => {
			e.preventDefault()
			const files = e.dataTransfer?.files
			if (files && files.length > 0 && isImage(files[0])) {
				onFile(files[0], e)
				setLabelText(t('selected'))
				setHasImg(true)
				setUrl(URL.createObjectURL(files[0]))
			}
		}

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault()
			setLabelText(t('drag'))
		}

		el.addEventListener('drop', handleDrop)
		el.addEventListener('dragover', handleDragOver)

		return () => {
			el.removeEventListener('drop', handleDrop)
			el.removeEventListener('dragover', handleDragOver)
		}
	}, [onFile, t])

	monitorForElements({
		onDragStart: () => setLabelText(t('drag')),
		onDrag: () => setLabelText(t('nonDrag')),
	})

	const handleClick = () => inputRef.current?.click()

	const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file && isImage(file)) {
			onFile(file, event)
			setLabelText(t('selected'))
			setHasImg(true)
			setUrl(URL.createObjectURL(file))
		} else {
			setLabelText(t('invalid'))
		}
	}

	const removeImage = () => {
		if (inputRef.current) inputRef.current.value = ''
		setLabelText(t('nonDrag'))
		setHasImg(false)
		setUrl('')
	}

	// biome-ignore lint: UseEffect is only called once
	useEffect(() => {
		if (cleanFile) removeImage()
	}, [cleanFile])

	useEffect(() => {
		if (pictureUrl) {
			setHasImg(true)
			setUrl(pictureUrl)
		}
	}, [pictureUrl])

	useEffect(() => {
		setLabelText(t('nonDrag'))
	}, [t])

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full border border-primary-400 rounded-lg transition-colors duration-300 hover:border-primary-500 cursor-pointer"
		>
			{hasImg && (
				<button
					type="button"
					className=" btn btn-circle absolute top-1 right-1 z-10 cursor-pointer"
					onClick={removeImage}
					aria-label="Remove image"
				>
					<i className="i-material-symbols-close-rounded w-6! h-6!" />
				</button>
			)}

			<button
				type="button"
				onClick={handleClick}
				className="relative w-full h-full flex flex-col justify-center items-center gap-4"
				aria-label={hasImg ? 'Change image' : 'Select image'}
			>
				{!hasImg && (
					<>
						<span className="text-center text-xl text-primary-600 cursor-pointer px-8">
							{labelText}
						</span>
						<div className="w-16 h-16 bg-primary-600 pointer-events-none">
							<i className="i-mdi-file-upload w-10! h-10!" />
						</div>
					</>
				)}

				{hasImg && (
					<img
						src={url}
						alt="Imagen seleccionada"
						className="w-full h-full max-w-full max-h-full object-cover rounded-lg"
					/>
				)}

				<input
					type="file"
					accept="image/*"
					ref={inputRef}
					onChange={handleFileInput}
					className="absolute w-full h-full opacity-0 -z-10"
					disabled={hasImg}
					hidden
					{...rest}
				/>
			</button>
		</div>
	)
}

const isImage = (file: File): boolean => file.type.startsWith('image/')
