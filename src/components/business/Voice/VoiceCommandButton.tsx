import { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface VoiceCommandButtonProps {
    onClick: () => void
}

export const VoiceCommandButton = memo<VoiceCommandButtonProps>(({ onClick }) => {
    const { t } = useTranslation(['voiceRecorder'])

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={t('startVoiceCommand')}
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
        </button>
    )
})

VoiceCommandButton.displayName = 'VoiceCommandButton'
