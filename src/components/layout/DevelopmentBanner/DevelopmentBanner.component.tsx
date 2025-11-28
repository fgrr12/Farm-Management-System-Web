import { memo } from 'react'

import { useEnvironment } from '@/hooks/system/useEnvironment'

export const DevelopmentBanner = memo(() => {
	const { isDevelopment, currentEnvironment, getEnvironmentColor, getEnvironmentIcon } =
		useEnvironment()

	if (!isDevelopment) return null

	const colorClass =
		getEnvironmentColor() === 'orange'
			? 'from-orange-500 to-red-500'
			: 'from-yellow-500 to-orange-500'

	return (
		<div
			className={`w-full bg-linear-to-r ${colorClass} text-white text-center py-2 shadow-lg z-50`}
		>
			<div className="flex items-center justify-center gap-2 text-sm font-medium">
				<i className={`${getEnvironmentIcon()} w-4! h-4!`} />
				<span>🚧 {currentEnvironment.toUpperCase()} MODE 🚧</span>
				<i className={`${getEnvironmentIcon()} w-4! h-4!`} />
			</div>
		</div>
	)
})

DevelopmentBanner.displayName = 'DevelopmentBanner'
