import { currentEnvironment, isDevelopment, isProduction } from '@/config/environment'

/**
 * Hook to get current environment information
 * Provides utilities to check environment and get environment-specific data
 */
export const useEnvironment = () => {
	return {
		isDevelopment,
		isProduction,
		currentEnvironment,

		showDebugInfo: isDevelopment,
		enableAnalytics: isProduction,
		apiTimeout: isDevelopment ? 10000 : 5000,

		getEnvironmentColor: () => {
			switch (currentEnvironment) {
				case 'development':
					return 'orange'
				case 'staging':
					return 'yellow'
				case 'production':
					return 'green'
				default:
					return 'gray'
			}
		},

		getEnvironmentIcon: () => {
			switch (currentEnvironment) {
				case 'development':
					return 'i-material-symbols-construction'
				case 'staging':
					return 'i-material-symbols-science'
				case 'production':
					return 'i-material-symbols-rocket-launch'
				default:
					return 'i-material-symbols-help'
			}
		},
	}
}
