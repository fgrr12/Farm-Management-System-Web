export type OfflineQueueKind =
	| 'createAnimal'
	| 'updateAnimal'
	| 'createHealthRecord'
	| 'updateHealthRecord'
	| 'createProductionRecord'
	| 'updateProductionRecord'

export interface OfflineQueueItem {
	id: string
	kind: OfflineQueueKind
	payload: Record<string, any>
	createdAt: number
	retries: number
}

export type OfflineQueueStore = {
	queue: OfflineQueueItem[]
	enqueue: (kind: OfflineQueueKind, payload: Record<string, any>) => void
	dequeue: (id: string) => void
	bumpRetry: (id: string) => void
}
