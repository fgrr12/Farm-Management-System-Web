import dayjs from 'dayjs'
import 'dayjs/locale/es'
import 'dayjs/locale/en'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

const ALL_NAMESPACES = [
	'animal',
	'animalForm',
	'animalHealthRecords',
	'animalProductionRecords',
	'animalRelations',
	'animals',
	'calendar',
	'common',
	'dashboard',
	'dropzone',
	'employeeForm',
	'employees',
	'employeesData',
	'externalRelationForm',
	'healthRecordForm',
	'loginForm',
	'myAccount',
	'mySpecies',
	'notifications',
	'productionRecordForm',
	'relatedAnimals',
	'taskForm',
	'tasks',
	'taxDetails',
	'voice',
	'voiceRecorder',
]

i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		lng: 'spa',
		ns: ALL_NAMESPACES,
		defaultNS: 'common',
		// debug: true,
		react: {
			useSuspense: false,
		},
	})

/**
 * Keep dayjs on the same language as the UI.
 *
 * This lives here, next to i18n init, on purpose: it used to be a module-level
 * `dayjs.locale('es')` inside the lazy-loaded Calendar, so the whole app silently
 * switched to Spanish dates the moment anyone opened /calendar — and stayed in
 * English before that. Setting it once, here, makes it deterministic.
 */
const syncDayjsLocale = (language: string) => {
	dayjs.locale(language === 'eng' ? 'en' : 'es')
}

syncDayjsLocale(i18n.language)
i18n.on('languageChanged', syncDayjsLocale)

export default i18n
