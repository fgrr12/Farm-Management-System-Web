/**
 * Animates a number from `start` to `end` over `duration` ms using requestAnimationFrame.
 * Returns a cancel function.
 */
export function animateValue(
	start: number,
	end: number,
	duration: number,
	onUpdate: (value: number) => void
): () => void {
	if (duration <= 0 || start === end) {
		onUpdate(end)
		return () => {}
	}

	let rafId: number
	const startTime = performance.now()

	const tick = (now: number) => {
		const elapsed = now - startTime
		const progress = Math.min(elapsed / duration, 1)
		// ease-out quad
		const eased = 1 - (1 - progress) * (1 - progress)
		const current = start + (end - start) * eased

		onUpdate(Number.isInteger(end) ? Math.round(current) : Number.parseFloat(current.toFixed(1)))

		if (progress < 1) {
			rafId = requestAnimationFrame(tick)
		}
	}

	rafId = requestAnimationFrame(tick)
	return () => cancelAnimationFrame(rafId)
}
