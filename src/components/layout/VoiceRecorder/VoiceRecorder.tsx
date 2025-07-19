import { useEffect, useRef, useState } from 'react'

import { ActionButton } from '@/components/ui/ActionButton'

export const VoiceRecorder = () => {
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const [open, setOpen] = useState(false)
	const [recording, setRecording] = useState(false)
	const [recordingTime, setRecordingTime] = useState(0)
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
	const [transcript, setTranscript] = useState('')
	const [audioUrl, setAudioUrl] = useState('')
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	const MAX_DURATION = 30

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const mediaRecorder = new MediaRecorder(stream)
			const chunks: BlobPart[] = []

			mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks, { type: 'audio/webm' })
				setAudioBlob(blob)
				stream.getTracks().forEach((track) => track.stop()) // Clean up microphone
				streamRef.current = null
			}

			mediaRecorderRef.current = mediaRecorder
			streamRef.current = stream
			mediaRecorder.start()
			setRecordingTime(0)
			setRecording(true)

			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1)
			}, 1000)
		} catch (err) {
			console.error('Error starting recording:', err)
		}
	}

	const stopRecording = () => {
		mediaRecorderRef.current?.stop()
		if (timerRef.current) clearInterval(timerRef.current)
		setRecording(false)
		setRecordingTime(0)
	}

	const sendAudio = async () => {
		if (!audioBlob) return

		try {
			const formData = new FormData()
			formData.append('audio', audioBlob, 'audio.webm')

			const res = await fetch('http://localhost:3000/api/transcribir', {
				method: 'POST',
				body: formData,
			})

			const data = await res.json()
			setTranscript(data.texto || data.error || 'Error al transcribir')
		} catch (err) {
			console.error('Error sending audio:', err)
			setTranscript('Error sending audio')
		}
	}

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		if (recording && recordingTime >= MAX_DURATION) {
			stopRecording()
		}
	}, [recording, recordingTime])

	useEffect(() => {
		if (audioBlob) {
			setAudioUrl(URL.createObjectURL(audioBlob))
		}
		if (recording) {
			setAudioUrl('')
		}
	}, [audioBlob, recording])

	return (
		<div className="flex flex-row items-end justify-end gap-4 absolute bottom-4 right-4 w-full">
			{open && (
				<div className="chat chat-end w-full mb-3">
					<div className="chat-bubble w-full bg-gray-200 rounded-2xl p-4">
						<div className="flex flex-col sm:flex-row gap-4 w-full items-center">
							<button
								type="button"
								className="btn"
								onClick={recording ? stopRecording : startRecording}
								aria-label={recording ? 'Stop recording' : 'Start recording'}
							>
								<i
									className={`w-6! h-6! ${recording ? 'i-material-symbols-stop-circle-outline-rounded' : 'i-material-symbols-play-circle-outline-rounded'}`}
								/>
							</button>

							<div className="flex flex-col gap-2 items-center flex-1 max-w-60">
								<div className="w-full h-1 bg-gray-400 rounded-full">
									<div
										className={`w-full h-1 rounded-full animate-pulse ${
											recording ? 'bg-blue-500' : 'bg-gray-400'
										}`}
									/>
								</div>
								<div className="text-xs text-gray-500">
									{recording
										? `Recording... ${recordingTime}s`
										: `Recording duration: ${recordingTime}s`}
								</div>
							</div>

							<button
								type="button"
								className="btn"
								onClick={sendAudio}
								disabled={!audioBlob || recording}
								aria-label="Send audio for transcription"
							>
								Send
							</button>
						</div>

						<p className="mt-4 text-sm text-gray-700">
							<strong>Transcription:</strong> {transcript}
						</p>
						<div key={audioUrl} className="mt-4 max-w-100">
							<p className="text-sm text-gray-700 font-semibold mb-1">Play recorded audio:</p>
							<audio controls className="w-full">
								<source src={audioUrl} type="audio/webm" />
								<track kind="captions" />
								Your browser does not support audio.
							</audio>
						</div>
					</div>
				</div>
			)}

			<ActionButton
				className="btn bg-info border-none shadow-none rounded-4xl p-2"
				icon={open ? 'i-lineicons-xmark' : 'i-lineicons-microphone-1'}
				onClick={() => setOpen(!open)}
				aria-label={open ? 'Close voice recorder' : 'Open voice recorder'}
			/>
		</div>
	)
}
