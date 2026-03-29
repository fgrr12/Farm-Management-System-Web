import type { Farm, ProductionRecord } from '@/types'

export interface ProductionRecordsTableProps {
	productionRecords: ProductionRecord[]
	haveUser: boolean
	farm: Farm | null
	removeProductionRecord: (uuid: string) => void
}
