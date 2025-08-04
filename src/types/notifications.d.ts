interface NotificationData {
	uuid: string
	title: string
	message: string
	type: 'info' | 'success' | 'warning' | 'error'
	category: 'general' | 'medication' | 'health' | 'task'
	read: boolean
	dismissed: boolean
	createdAt: string
	farmUuid: string
	animalUuid?: string
	eventUuid?: string
	actionUrl?: string
}
