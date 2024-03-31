interface FileToBase64 {
	data: string
	contentType: string
}

const OFFSET_TEXT = 'base64,'

export const fileToBase64 = async (file: File): Promise<FileToBase64> => {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.addEventListener('load', (event) => {
			const dataUrl = event.target!.result as string
			const data = dataUrl.slice(dataUrl.indexOf(OFFSET_TEXT) + OFFSET_TEXT.length)
			resolve({ data, contentType: file.type })
		})
		reader.readAsDataURL(file)
	})
}
