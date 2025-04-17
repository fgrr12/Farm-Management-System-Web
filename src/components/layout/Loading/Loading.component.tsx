import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoadingProps, LoadingRef } from './Loading.types'

export const Loading: FC<LoadingProps> = ({ open, ...rest }) => {
	const { t } = useTranslation(['common'])
	const { loadingRef } = useLoading(open)

	return (
		<dialog
			ref={loadingRef}
			{...rest}
			className="
				fixed
				top-1/2
				left-1/2
				-translate-x-1/2
				-translate-y-1/2
				border-none
				bg-transparent
				outline-none
				overflow-hidden
				backdrop-blur-xl
				backdrop:bg-neutral-500
				"
		>
			<div className="flex justify-center items-center h-10 mb-8!">
				<span className="text-white text-4xl mx-1">{t('loading')}</span>
				<span className="text-white text-5xl mx-1 animate-dot-pulse delay-0">.</span>
				<span className="text-white text-5xl mx-1 animate-dot-pulse delay-100">.</span>
				<span className="text-white text-5xl mx-1 animate-dot-pulse delay-200">.</span>
			</div>

			<div className="flex justify-center items-center w-screen">
				<i className="i-fluent-emoji-flat-cow w-12! h-12! mx-2 animate-slide-left delay-0" />
				<i className="i-emojione-chicken w-12! h-12! mx-2 animate-slide-left delay-100" />
				<i className="i-fxemoji-sheep w-12! h-12! mx-2 animate-slide-left delay-200" />
				<i className="i-emojione-goat w-12! h-12! mx-2 animate-slide-left delay-300" />
			</div>
		</dialog>
	)
}

const useLoading = (open?: boolean) => {
	const loadingRef: LoadingRef = useRef(null!)

	useEffect(() => {
		if (!loadingRef.current) return
		open ? loadingRef.current.showModal() : loadingRef.current.close()
	}, [open])

	return { loadingRef }
}
