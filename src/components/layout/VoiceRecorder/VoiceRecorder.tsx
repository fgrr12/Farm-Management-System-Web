import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'

export const VoiceRecorder = () => {
	const { t } = useTranslation(['voiceRecorder'])
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
			setTranscript(data.texto || data.error || t('transcriptionError'))
		} catch (err) {
			console.error('Error sending audio:', err)
			setTranscript(t('sendError'))
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
		<div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4 max-w-sm w-full pointer-events-none">
			<div className="pointer-events-auto">
				{open && (
					<div className="w-full mb-3 animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto">
						<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-sm max-h-[calc(100vh-120px)] overflow-y-auto">
							{/* Header */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
									<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
										{t('title')}
									</h3>
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
									{recording ? t('recording') : t('ready')}
								</div>
							</div>

							{/* Main Controls */}
							<div className="flex flex-col sm:flex-row gap-4 w-full items-center">
								<button
									type="button"
									className={`btn btn-circle btn-lg transition-all duration-200 ${
										recording
											? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 border-red-500 dark:border-red-600 text-white shadow-lg shadow-red-500/25'
											: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border-blue-500 dark:border-blue-600 text-white shadow-lg shadow-blue-500/25'
									}`}
									onClick={recording ? stopRecording : startRecording}
									aria-label={recording ? t('stopRecording') : t('startRecording')}
								>
									<i
										className={`w-7 h-7 transition-transform duration-200 ${
											recording
												? 'i-material-symbols-stop-circle-outline-rounded scale-110'
												: 'i-material-symbols-play-circle-outline-rounded hover:scale-110'
										}`}
									/>
								</button>

								{/* Recording Status */}
								<div className="flex flex-col gap-3 items-center flex-1 max-w-60">
									{/* Progress Bar */}
									<div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all duration-300 ${
												recording
													? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 animate-pulse'
													: 'bg-gray-300 dark:bg-gray-600'
											}`}
											style={{
												width: recording ? '100%' : `${Math.min((recordingTime / 60) * 100, 100)}%`,
											}}
										/>
									</div>

									{/* Time Display */}
									<div
										className={`text-sm font-mono transition-colors duration-200 ${
											recording
												? 'text-blue-600 dark:text-blue-400 font-semibold'
												: 'text-gray-500 dark:text-gray-400'
										}`}
									>
										{recording ? (
											<span className="flex items-center gap-2">
												<div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
												{Math.floor(recordingTime / 60)}:
												{(recordingTime % 60).toString().padStart(2, '0')}
											</span>
										) : (
											<span>
												{t('duration')}: {Math.floor(recordingTime / 60)}:
												{(recordingTime % 60).toString().padStart(2, '0')}
											</span>
										)}
									</div>
								</div>

								{/* Send Button */}
								<button
									type="button"
									className={`btn btn-outline transition-all duration-200 ${
										!audioBlob || recording
											? 'btn-disabled opacity-50 cursor-not-allowed'
											: 'btn-success hover:btn-success hover:scale-105 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-white shadow-lg'
									}`}
									onClick={sendAudio}
									disabled={!audioBlob || recording}
									aria-label={t('sendAudio')}
								>
									<i className="i-material-symbols-send w-5 h-5" />
									{t('send')}
								</button>
							</div>

							{/* Transcription Section */}
							{transcript && (
								<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200">
									<div className="flex items-center gap-2 mb-2">
										<i className="i-material-symbols-transcribe w-4 h-4 text-blue-500 dark:text-blue-400" />
										<span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
											{t('transcript')}
										</span>
									</div>
									<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
										{transcript}
									</p>
								</div>
							)}

							{/* Audio Player Section */}
							{audioUrl && (
								<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200">
									<div className="flex items-center gap-2 mb-3">
										<i className="i-material-symbols-volume-up w-4 h-4 text-green-500 dark:text-green-400" />
										<span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
											{t('recordedAudio')}
										</span>
									</div>
									<audio
										controls
										className="w-full h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
										key={audioUrl}
									>
										<source src={audioUrl} type="audio/webm" />
										<track kind="captions" />
										{t('audioNotSupported')}
									</audio>
								</div>
							)}

							{/* Help Text */}
							<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<p className="text-xs text-blue-700 dark:text-blue-300 text-center">
									💡 {t('helpText')}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Floating Action Button */}
				<div className="relative">
					<ActionButton
						className={`btn btn-circle btn-lg border-none shadow-lg transition-all duration-300 ${
							open
								? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rotate-45 shadow-red-500/25'
								: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white hover:scale-110 shadow-blue-500/25'
						}`}
						icon={open ? 'i-lineicons-xmark' : 'i-lineicons-microphone-1'}
						onClick={() => setOpen(!open)}
						aria-label={open ? t('close') : t('open')}
					/>

					{/* Notification Badge */}
					{recording && (
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
					)}

					{audioBlob && !open && (
						<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full">
							<div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
