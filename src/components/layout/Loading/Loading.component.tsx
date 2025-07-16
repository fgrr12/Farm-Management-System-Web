import gsap from 'gsap'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { LoadingProps, LoadingRef } from './Loading.types'

export const Loading: FC<LoadingProps> = ({ open, ...rest }) => {
	const { t } = useTranslation(['common'])
	const { loadingRef } = useLoading(open)

	const dotsRef = useRef<HTMLSpanElement[]>([])
	const iconsRef = useRef<HTMLSpanElement[]>([])

	//biome-ignore lint:: ignore it
	const setDotsRef = (i: number) => (el: HTMLElement | null) => (dotsRef.current[i] = el!)
	//biome-ignore lint:: ignore it
	const setIconsRef = (i: number) => (el: HTMLElement | null) => (iconsRef.current[i] = el!)

	useEffect(() => {
		if (dotsRef.current.length) {
			gsap.to(dotsRef.current, {
				scale: 1.2,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
				stagger: 0.1,
				duration: 0.6,
			})
		}

		if (iconsRef.current.length) {
			gsap.to(iconsRef.current, {
				x: -64,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
				stagger: 0.1,
				duration: 1.2,
			})
		}
	}, [])

	return (
		<>
			{open && (
				<div className="fixed inset-0 z-40 backdrop-blur-md bg-black/30" aria-hidden="true" />
			)}

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
					backdrop:bg-neutral-500
					z-50
				"
			>
				<div className="flex justify-center items-center h-10 mb-8!">
					<span className="text-white text-4xl mx-1">{t('loading')}</span>
					{['.', '.', '.'].map((dot, i) => (
						<span key={i} ref={setDotsRef(i) as any} className="text-white text-5xl mx-1">
							{dot}
						</span>
					))}
				</div>

				<div className="flex justify-center items-center w-screen">
					{[
						'i-fluent-emoji-flat-cow',
						'i-emojione-chicken',
						'i-fxemoji-sheep',
						'i-emojione-goat',
					].map((icon, i) => (
						<i key={i} ref={setIconsRef(i) as any} className={`${icon} w-12! h-12! mx-2`} />
					))}
				</div>
			</dialog>
		</>
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
