import { httpsCallable } from 'firebase/functions'

import { functions } from '@/config/firebaseConfig'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

/**
 * Get user language preference with priority hierarchy: user → farm → system
 *
 * Priority order:
 * 1. User's personal language setting (user.language)
 * 2. Farm's default language setting (farm.language)
 * 3. System/browser language (document.documentElement.lang)
 * 4. Default fallback to 'en' if none available
 *
 * @returns {string} The detected language code
 */
const getUserLanguagePreference = (): string => {
	// Access stores directly (not as hooks since this is inside a function)
	const { user } = useUserStore.getState()
	const { farm } = useFarmStore.getState()

	// 1st Priority: User's personal language preference
	if (user?.language) {
		return user.language
	}

	// 2nd Priority: Farm's default language preference
	if (farm?.language) {
		return farm.language
	}

	// 3rd Priority: System/Browser language detection
	const systemLanguage =
		typeof window !== 'undefined' ? document.documentElement.lang || 'en' : 'en'

	return systemLanguage
}

/**
 * Map frontend language codes to backend language codes
 *
 * Supports multiple input formats:
 * - Short codes: 'es', 'en'
 * - Long codes: 'es-ES', 'en-US'
 * - Full names: 'spanish', 'english'
 * - Backend codes: 'spa', 'eng'
 *
 * @param {string} language - The language code to map
 * @returns {'spa' | 'eng'} Standardized backend language code
 */
const mapLanguageCode = (language: string): 'spa' | 'eng' => {
	// Handle both short codes (es, en) and long codes (es-ES, en-US, spa, eng)
	const langCode = language.toLowerCase().split('-')[0]

	switch (langCode) {
		case 'es':
		case 'spa':
		case 'spanish':
			return 'spa'
		// case 'en':
		// case 'eng':
		// case 'english':
		default:
			return 'eng' // Default fallback to English
	}
}

export const callableFireFunction = async <TResponse, TRequest = unknown>(
	functionName: string,
	payload: TRequest
): Promise<TResponse> => {
	try {
		// Get language preference with priority: user → farm → system
		const userLanguage = getUserLanguagePreference()
		const mappedLanguage = mapLanguageCode(userLanguage)

		// Add language to payload if it's an object
		const enhancedPayload =
			payload && typeof payload === 'object' ? { ...payload, language: mappedLanguage } : payload

		// Create callable function
		const callableFunction = httpsCallable<TRequest, TResponse>(functions, functionName, {
			timeout: 60000, // 60 seconds timeout
		})

		const result = await callableFunction(enhancedPayload)
		return result.data
	} catch (error) {
		console.error(`Error calling Firebase function '${functionName}':`, {
			error,
			payload,
			functionName,
		})
		throw error
	}
}
