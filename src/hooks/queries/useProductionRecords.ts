import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { ProductionRecordsService } from '@/services/productionRecords'

export const PRODUCTION_RECORDS_KEYS = {
	all: ['productionRecords'] as const,
	list: (animalUuid: string) => [...PRODUCTION_RECORDS_KEYS.all, 'list', animalUuid] as const,
	detail: (productionRecordUuid: string) =>
		[...PRODUCTION_RECORDS_KEYS.all, 'detail', productionRecordUuid] as const,
}

export const useProductionRecords = (animalUuid: string) => {
	return useQuery({
		queryKey: PRODUCTION_RECORDS_KEYS.list(animalUuid),
		queryFn: () => ProductionRecordsService.getProductionRecords(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useProductionRecord = (productionRecordUuid: string) => {
	return useQuery({
		queryKey: PRODUCTION_RECORDS_KEYS.detail(productionRecordUuid),
		queryFn: () => ProductionRecordsService.getProductionRecord(productionRecordUuid),
		enabled: !!productionRecordUuid,
	})
}

export const useCreateProductionRecord = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({
			productionRecord,
			userUuid,
		}: {
			productionRecord: ProductionRecord
			userUuid: string
		}) => ProductionRecordsService.setProductionRecord(productionRecord, userUuid, farm?.uuid),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: PRODUCTION_RECORDS_KEYS.list(variables.productionRecord.animalUuid),
			})
		},
	})
}

export const useUpdateProductionRecord = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({
			productionRecord,
			userUuid,
		}: {
			productionRecord: ProductionRecord
			userUuid: string
		}) => ProductionRecordsService.updateProductionRecord(productionRecord, userUuid, farm?.uuid),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: PRODUCTION_RECORDS_KEYS.detail(variables.productionRecord.uuid || ''),
			})
			queryClient.invalidateQueries({
				queryKey: PRODUCTION_RECORDS_KEYS.list(variables.productionRecord.animalUuid),
			})
		},
	})
}

export const useDeleteProductionRecord = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			productionRecordUuid,
			userUuid,
		}: {
			productionRecordUuid: string
			userUuid: string
		}) => ProductionRecordsService.updateProductionRecordStatus(productionRecordUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PRODUCTION_RECORDS_KEYS.all })
		},
	})
}
