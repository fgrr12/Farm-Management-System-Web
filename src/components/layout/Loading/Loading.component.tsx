import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { FC } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
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
		const dotsRef = useRef<HTMLSpanElement[]>([])
		const iconsRef = useRef<HTMLElement[]>([])
		const spinnerRef = useRef<HTMLDivElement>(null)
		const circularContainerRef = useRef<HTMLDivElement>(null)

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

		const setDotsRef = useCallback(
			(i: number) => (el: HTMLSpanElement | null) => {
				if (el) dotsRef.current[i] = el
			},
			[]
		)

		const setIconsRef = useCallback(
			(i: number) => (el: HTMLElement | null) => {
				if (el) iconsRef.current[i] = el
			},
			[]
		)

		useGSAP(() => {
			if (!open) return

			const container = containerRef.current
			if (container) {
				gsap.fromTo(
					container,
					{ scale: 0.8, opacity: 0 },
					{ scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
				)
			}

			// Variant-specific animations
			switch (variant) {
				case 'dots':
					if (dotsRef.current.length) {
						gsap.to(dotsRef.current, {
							scale: 1.3,
							repeat: -1,
							yoyo: true,
							ease: 'power2.inOut',
							stagger: 0.15,
							duration: 0.6,
						})
					}
					break

				case 'default':
					// Elliptical carousel - simulates a circle viewed from the side
					if (iconsRef.current.length && circularContainerRef.current) {
						const ellipseWidth = 280 // Increased ellipse width
						const ellipseHeight = 40 // Increased ellipse height for better visibility

						// Create elliptical movement for each icon
						iconsRef.current.forEach((icon, i) => {
							const startAngle = (i / iconsRef.current.length) * Math.PI * 2

							// Create a timeline for each icon
							const tl = gsap.timeline({ repeat: -1, ease: 'none' })

							// Animate the angle from 0 to 2π
							tl.to(
								{ angle: startAngle },
								{
									angle: startAngle + Math.PI * 2,
									duration: 5, // Slightly slower for better visibility
									ease: 'none',
									onUpdate: function () {
										const currentAngle = this.targets()[0].angle

										// Calculate elliptical position (centered in container)
										const x = Math.cos(currentAngle) * (ellipseWidth / 2)
										const y = Math.sin(currentAngle) * (ellipseHeight / 2)

										// Calculate depth effect based on distance from center
										// When x is close to 0 (center), icon should be largest
										// When x is far from center (sides), icon should be smallest
										const distanceFromCenter = Math.abs(x) / (ellipseWidth / 2) // 0 to 1
										const depthFactor = 1 - distanceFromCenter // 1 at center, 0 at sides

										// Hide icons when they're behind (sin(angle) < 0)
										// Only show icons in the front half of the ellipse
										const isVisible = Math.sin(currentAngle) >= -0.1 // Small buffer for smoother transition

										if (isVisible) {
											const scale = 0.6 + depthFactor * 0.8 // 0.6 to 1.4 (bigger range)
											const opacity = 0.3 + depthFactor * 0.7 // 0.3 to 1.0

											gsap.set(icon, {
												x: x,
												y: y,
												scale: scale,
												opacity: opacity,
												visibility: 'visible',
												zIndex: Math.round(depthFactor * 10),
											})
										} else {
											// Hide icons when they're behind
											gsap.set(icon, {
												x: x,
												y: y,
												opacity: 0,
												visibility: 'hidden',
												zIndex: 0,
											})
										}
									},
								}
							)
						})
					}
					break

				case 'pulse':
					if (container) {
						gsap.to(container, {
							scale: 1.05,
							repeat: -1,
							yoyo: true,
							ease: 'power2.inOut',
							duration: 1,
						})
					}
					break

				case 'spinner':
					if (spinnerRef.current) {
						gsap.to(spinnerRef.current, {
							rotation: 360,
							repeat: -1,
							ease: 'none',
							duration: 1,
						})
					}
					break
			}
		}, [open, variant])

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
								{[0, 1, 2].map((i) => {
									const refCallback = setDotsRef(i)
									return (
										<span key={i} ref={refCallback} className="w-3 h-3 bg-white rounded-full" />
									)
								})}
							</div>
						</div>
					)

				case 'pulse':
					return (
						<div className="flex flex-col items-center gap-4">
							<div className={`${sizeClasses.spinner} bg-white rounded-full opacity-80`} />
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
						</div>
					)

				case 'spinner':
					return (
						<div className="flex flex-col items-center gap-4">
							<div
								ref={spinnerRef}
								className={`${sizeClasses.spinner} border-4 border-white/20 border-t-white border-r-white rounded-full`}
							/>
							<span className={`text-white font-medium ${sizeClasses.text}`}>{displayMessage}</span>
						</div>
					)

				default: // 'default' variant with circular farm animals
					return (
						<div className="flex flex-col items-center gap-8">
							<div className="flex items-center gap-1">
								<span className={`text-white font-medium ${sizeClasses.text}`}>
									{displayMessage}
								</span>
								{[0, 1, 2].map((i) => {
									const refCallback = setDotsRef(i)
									return (
										<span key={i} ref={refCallback} className="w-3 h-3 bg-white rounded-full" />
									)
								})}
							</div>

							{/* Elliptical Carousel Animal Icons */}
							<div className="relative flex items-center justify-center">
								<div
									ref={circularContainerRef}
									className="relative flex items-center justify-center"
									style={{ width: '320px', height: '80px' }}
								>
									{animalIcons.map((icon, i) => {
										const refCallback = setIconsRef(i)
										return (
											<i
												key={i}
												ref={refCallback}
												className={`${icon} ${sizeClasses.icon} absolute`}
											/>
										)
									})}
								</div>
							</div>
						</div>
					)
			}
		}

		// Don't render anything if not open
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
