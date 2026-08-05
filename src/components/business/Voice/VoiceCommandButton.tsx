import { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface VoiceCommandButtonProps {
	onClick: () => void
	/** Recordings waiting for signal or for the user to review — shown as a badge so a
	 *  voice command made in the field doesn't just get forgotten once back online. */
	badgeCount?: number
}

export const VoiceCommandButton = memo<VoiceCommandButtonProps>(({ onClick, badgeCount = 0 }) => {
	const { t } = useTranslation(['voiceRecorder'])

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={
				badgeCount > 0 ? t('queue.readyBanner', { count: badgeCount }) : t('startVoiceCommand')
			}
			className="
				fixed bottom-6 right-6 z-40
				w-14 h-14 rounded-full
				bg-linear-to-br from-pink-500 to-purple-600
				hover:from-pink-600 hover:to-purple-700
				text-white shadow-lg shadow-pink-500/30
				hover:shadow-xl hover:shadow-pink-500/40
				transition-all duration-300
				hover:scale-110 active:scale-95
				focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-800
				flex items-center justify-center
				cursor-pointer
				max-sm:bottom-20 max-sm:right-4
				animate-scale-bounce-in
			"
		>
			<span className="i-heroicons-microphone w-7! h-7!" />
			{badgeCount > 0 && (
				<span
					aria-hidden="true"
					className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900"
				>
					{badgeCount > 9 ? '9+' : badgeCount}
				</span>
			)}
		</button>
	)
})

VoiceCommandButton.displayName = 'VoiceCommandButton'
