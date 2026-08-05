import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { withOfflineQueue } from '@/utils/offlineQueue'

import { ProductionRecordsService } from '@/services/productionRecords'

import type { ProductionRecord } from '@/types'

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
		// Bypass TanStack Query's own online/offline pausing — withOfflineQueue inside
		// mutationFn already handles offline, and 'online' mode would pause before it runs.
		networkMode: 'always',
		mutationFn: ({
			productionRecord,
			userUuid,
		}: {
			productionRecord: ProductionRecord
			userUuid: string
		}) => {
			const farmUuid = farm?.uuid
			return withOfflineQueue(
				async () => ({
					...(await ProductionRecordsService.setProductionRecord(
						productionRecord,
						userUuid,
						farmUuid
					)),
					pendingSync: false,
				}),
				() => ({ uuid: crypto.randomUUID(), isNew: true, pendingSync: true }),
				'createProductionRecord',
				{ productionRecord, userUuid, farmUuid }
			)
		},

		// OPTIMISTIC UPDATE: Add to list immediately with temporary ID
		onMutate: async ({ productionRecord }) => {
			const animalUuid = productionRecord.animalUuid

			// Cancel any outgoing refetches for this animal's production records
			await queryClient.cancelQueries({
				queryKey: PRODUCTION_RECORDS_KEYS.list(animalUuid),
			})

			// Snapshot the previous value for rollback
			const previousRecords = queryClient.getQueryData(PRODUCTION_RECORDS_KEYS.list(animalUuid))

			// Create optimistic record with temporary ID
			const optimisticRecord: ProductionRecord = {
				...productionRecord,
				uuid: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				pendingSync: !navigator.onLine,
			}

			// Add to cache immediately
			queryClient.setQueryData(
				PRODUCTION_RECORDS_KEYS.list(animalUuid),
				(old: ProductionRecord[] | undefined) => {
					if (!old || !Array.isArray(old)) return [optimisticRecord]
					return [optimisticRecord, ...old] // Add at the beginning
				}
			)

			// Return context with snapshot and optimistic record
			return { previousRecords, optimisticRecord, animalUuid }
		},

		// SUCCESS: Replace temporary ID with real ID from server (keeps the rest of the
		// optimistic record's fields — the API only echoes back {uuid, isNew})
		onSuccess: (data, _variables, context) => {
			if (context?.optimisticRecord && context?.animalUuid && data?.uuid) {
				queryClient.setQueryData(
					PRODUCTION_RECORDS_KEYS.list(context.animalUuid),
					(old: ProductionRecord[] | undefined) => {
						if (!old || !Array.isArray(old)) return old
						return old.map((r) =>
							r.uuid === context.optimisticRecord.uuid
								? { ...context.optimisticRecord, uuid: data.uuid, pendingSync: data.pendingSync }
								: r
						)
					}
				)
			}
		},

		// ROLLBACK: If mutation fails, remove the optimistic record
		onError: (_err, _variables, context) => {
			if (context?.previousRecords && context?.animalUuid) {
				queryClient.setQueryData(
					PRODUCTION_RECORDS_KEYS.list(context.animalUuid),
					context.previousRecords
				)
			}
		},

		// SYNC: Always refetch to ensure consistency with server
		onSettled: (_data, _error, variables) => {
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
		networkMode: 'always',
		mutationFn: ({
			productionRecord,
			userUuid,
		}: {
			productionRecord: ProductionRecord
			userUuid: string
		}) =>
			withOfflineQueue(
				async () => ({
					...(await ProductionRecordsService.updateProductionRecord(
						productionRecord,
						userUuid,
						farm?.uuid
					)),
					pendingSync: false,
				}),
				() => ({ uuid: productionRecord.uuid || '', isNew: false, pendingSync: true }),
				'updateProductionRecord',
				{ productionRecord, userUuid, farmUuid: farm?.uuid }
			),
		// Flag the already-cached record as pending while offline — doesn't touch its other
		// fields, this mutation has no optimistic field merge (and no rollback) to begin with.
		onMutate: ({ productionRecord }) => {
			if (navigator.onLine) return
			queryClient.setQueryData(
				PRODUCTION_RECORDS_KEYS.list(productionRecord.animalUuid),
				(old: ProductionRecord[] | undefined) =>
					old?.map((r) => (r.uuid === productionRecord.uuid ? { ...r, pendingSync: true } : r))
			)
			queryClient.setQueryData(
				PRODUCTION_RECORDS_KEYS.detail(productionRecord.uuid || ''),
				(old: ProductionRecord | undefined) => (old ? { ...old, pendingSync: true } : old)
			)
		},
		onSuccess: (data, variables) => {
			queryClient.setQueryData(
				PRODUCTION_RECORDS_KEYS.list(variables.productionRecord.animalUuid),
				(old: ProductionRecord[] | undefined) =>
					old?.map((r) =>
						r.uuid === variables.productionRecord.uuid ? { ...r, pendingSync: data.pendingSync } : r
					)
			)
			queryClient.setQueryData(
				PRODUCTION_RECORDS_KEYS.detail(variables.productionRecord.uuid || ''),
				(old: ProductionRecord | undefined) =>
					old ? { ...old, pendingSync: data.pendingSync } : old
			)
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
