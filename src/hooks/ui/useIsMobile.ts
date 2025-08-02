import { useEffect, useState } from 'react'

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkIsMobile = () => {
			// Check for touch capability and screen size
			const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
			const isSmallScreen = window.innerWidth <= 768
			setIsMobile(hasTouchScreen && isSmallScreen)
		}

		checkIsMobile()
		window.addEventListener('resize', checkIsMobile)

		return () => {
			window.removeEventListener('resize', checkIsMobile)
		}
	}, [])

	return isMobile
}
