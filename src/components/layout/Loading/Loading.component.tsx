import type { FC } from 'react'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { LoadingProps } from './Loading.types'

export const Loading: FC<LoadingProps> = memo(
	({
		open,
		variant = 'default',
		size = 'md',
		message,
		showBackdrop = true,
		backdropBlur = true,
		...rest
	}) => {
		const { t } = useTranslation(['common'])
		useLoading(open)

		const containerRef = useRef<HTMLDivElement>(null)

		const sizeClasses = useMemo(() => {
			const sizes = {
				sm: { text: 'text-lg', icon: 'w-8! h-8!', spinner: 'w-8 h-8', container: 'w-24 h-24' },
				md: { text: 'text-2xl', icon: 'w-12! h-12!', spinner: 'w-12 h-12', container: 'w-32 h-32' },
				lg: { text: 'text-4xl', icon: 'w-16! h-16!', spinner: 'w-16 h-16', container: 'w-40 h-40' },
			}
			return sizes[size]
		}, [size])

		const animalIcons = [
			'i-fluent-emoji-flat-cow',
			'i-emojione-chicken',
			'i-fxemoji-sheep',
			'i-emojione-goat',
			'i-noto-pig-face',
			'i-noto-horse-face',
			'i-noto-rabbit-face',
			'i-noto-duck',
		]

		const renderContent = () => {
			const displayMessage = message || t('loading')

			switch (variant) {
				case 'minimal':
					return (
						<div className="flex flex-col items-center gap-4">
							<div
								className={`animate-spin ${sizeClasses.spinner} border-4 border-white/20 border-t-white rounded-full`}
							/>
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
						</div>
					)

				case 'dots':
					return (
						<div className="flex flex-col items-center gap-6">
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
							<div className="flex items-center gap-2">
								{[0, 1, 2].map((i) => (
									<span
										key={i}
										className="w-3 h-3 bg-white rounded-full animate-dot-pulse"
										style={{ animationDelay: `${i * 200}ms` }}
									/>
								))}
							</div>
						</div>
					)

				case 'pulse':
					return (
						<div className="flex flex-col items-center gap-4">
							<div
								className={`${sizeClasses.spinner} bg-white rounded-full opacity-80 animate-dot-pulse`}
							/>
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
						</div>
					)

				case 'spinner':
					return (
						<div className="flex flex-col items-center gap-4">
							<div
								className={`${sizeClasses.spinner} border-4 border-white/20 border-t-white border-r-white rounded-full animate-spin`}
							/>
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
						</div>
					)

				default:
					return (
						<div className="flex flex-col items-center gap-8">
							<div className="flex items-center gap-1">
								<span className={`text-white font-medium ${sizeClasses.text}`}>
									{displayMessage}
								</span>
								{[0, 1, 2].map((i) => (
									<span
										key={i}
										className="w-3 h-3 bg-white rounded-full animate-dot-pulse"
										style={{ animationDelay: `${i * 200}ms` }}
									/>
								))}
							</div>

							<div className="relative flex items-center justify-center">
								<div className="orbit-container" style={{ width: '320px', height: '80px' }}>
									{animalIcons.map((icon, i) => {
										const angle = (i / animalIcons.length) * 360
										return (
											<div
												key={i}
												className="absolute left-1/2 top-1/2"
												style={{
													animation: 'orbit 5s linear infinite',
													animationDelay: `${-(i / animalIcons.length) * 5}s`,
													width: 0,
													height: 0,
												}}
											>
												<i
													className={`${icon} ${sizeClasses.icon} block`}
													style={{ transform: 'translate(-50%, -50%)' }}
												/>
											</div>
										)
									})}
								</div>
							</div>
						</div>
					)
			}
		}

		if (!open) return null

		return (
			<>
				{showBackdrop && (
					<div
						className={`fixed inset-0 z-40 bg-black/40 ${backdropBlur ? 'backdrop-blur-sm' : ''}`}
						aria-hidden="true"
					/>
				)}

				<div
					{...rest}
					className="
					fixed inset-0 flex items-center justify-center
					z-50 w-full h-full pointer-events-none
				"
					role="dialog"
					aria-modal="true"
					aria-label="Loading"
				>
					<div
						ref={containerRef}
						data-container
						className="
						bg-black/70 backdrop-blur-md rounded-2xl 
						px-8 py-6 shadow-2xl border border-white/20
						min-w-[320px] max-w-sm mx-4 pointer-events-auto
					"
					>
						{renderContent()}
					</div>
				</div>
			</>
		)
	}
)

const useLoading = (open?: boolean) => {
	useEffect(() => {
		if (open) {
			// Prevent body scroll when loading is open
			document.body.style.overflow = 'hidden'
		} else {
			// Restore scroll when loading is closed
			document.body.style.overflow = 'unset'
		}

		// Cleanup function to ensure scroll is always restored
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [open])
}
