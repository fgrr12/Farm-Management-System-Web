export interface ProductionRecord {
	uuid: string
	animalUuid: string
	date: string
	quantity: number
	notes: string
	status: boolean
	createdAt?: string
	updatedAt?: string
	/** Set client-side while this write is still queued waiting for a connection; never sent to or read from the server. */
	pendingSync?: boolean
}
