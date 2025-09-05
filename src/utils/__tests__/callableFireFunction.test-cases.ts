// Test for language priority hierarchy in callableFireFunction
// This is for demonstration purposes

/*
LANGUAGE PRIORITY HIERARCHY TEST SCENARIOS:

Scenario 1: User has language preference
- User language: 'spa'
- Farm language: 'eng'  
- System language: 'en'
- Expected result: 'spa' (user preference wins)

Scenario 2: No user language, but farm has preference
- User language: undefined
- Farm language: 'eng'
- System language: 'es'
- Expected result: 'eng' (farm preference wins)

Scenario 3: Neither user nor farm have preference
- User language: undefined
- Farm language: undefined
- System language: 'es'
- Expected result: 'spa' (system language mapped)

Scenario 4: All sources undefined
- User language: undefined
- Farm language: undefined
- System language: undefined
- Expected result: 'eng' (default fallback)

Language Mapping Tests:
- 'es' → 'spa'
- 'es-ES' → 'spa'
- 'spanish' → 'spa'
- 'spa' → 'spa'
- 'en' → 'eng'
- 'en-US' → 'eng'
- 'english' → 'eng'
- 'eng' → 'eng'
- 'fr' → 'eng' (fallback)
- 'unknown' → 'eng' (fallback)
*/

export const languagePriorityTestCases = {
	userPreferenceWins: {
		userLanguage: 'spa',
		farmLanguage: 'eng',
		systemLanguage: 'en',
		expected: 'spa',
	},
	farmPreferenceWins: {
		userLanguage: undefined,
		farmLanguage: 'eng',
		systemLanguage: 'es',
		expected: 'eng',
	},
	systemLanguageWins: {
		userLanguage: undefined,
		farmLanguage: undefined,
		systemLanguage: 'es',
		expected: 'spa',
	},
	defaultFallback: {
		userLanguage: undefined,
		farmLanguage: undefined,
		systemLanguage: undefined,
		expected: 'eng',
	},
}
