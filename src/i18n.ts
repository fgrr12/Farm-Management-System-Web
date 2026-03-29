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
	'billingCard',
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

export default i18n
