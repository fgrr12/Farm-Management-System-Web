import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { HealthRecordsService } from '@/services/healthRecords'

export const HEALTH_RECORDS_KEYS = {
	all: ['healthRecords'] as const,
	list: (animalUuid: string) => [...HEALTH_RECORDS_KEYS.all, 'list', animalUuid] as const,
	detail: (healthRecordUuid: string) =>
		[...HEALTH_RECORDS_KEYS.all, 'detail', healthRecordUuid] as const,
}

export const useHealthRecords = (animalUuid: string) => {
	return useQuery({
		queryKey: HEALTH_RECORDS_KEYS.list(animalUuid),
		queryFn: () => HealthRecordsService.getHealthRecords(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useHealthRecord = (healthRecordUuid: string) => {
	return useQuery({
		queryKey: HEALTH_RECORDS_KEYS.detail(healthRecordUuid),
		queryFn: () => HealthRecordsService.getHealthRecord(healthRecordUuid),
		enabled: !!healthRecordUuid,
	})
}

export const useCreateHealthRecord = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ healthRecord, userUuid }: { healthRecord: HealthRecord; userUuid: string }) =>
			HealthRecordsService.setHealthRecord(healthRecord, userUuid, farm?.uuid),

		// OPTIMISTIC UPDATE: Add to list immediately with temporary ID
		onMutate: async ({ healthRecord }) => {
			const animalUuid = healthRecord.animalUuid

			// Cancel any outgoing refetches for this animal's health records
			await queryClient.cancelQueries({
				queryKey: HEALTH_RECORDS_KEYS.list(animalUuid),
			})

			// Snapshot the previous value for rollback
			const previousRecords = queryClient.getQueryData(HEALTH_RECORDS_KEYS.list(animalUuid))

			// Create optimistic record with temporary ID
			const optimisticRecord: HealthRecord = {
				...healthRecord,
				uuid: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			}

			// Add to cache immediately
			queryClient.setQueryData(
				HEALTH_RECORDS_KEYS.list(animalUuid),
				(old: HealthRecord[] | undefined) => {
					if (!old || !Array.isArray(old)) return [optimisticRecord]
					return [optimisticRecord, ...old] // Add at the beginning
				}
			)

			// Return context with snapshot and optimistic record
			return { previousRecords, optimisticRecord, animalUuid }
		},

		// SUCCESS: Replace temporary ID with real ID from server
		onSuccess: (data, _variables, context) => {
			if (context?.optimisticRecord && context?.animalUuid && data?.uuid) {
				// Replace the temporary record with the real one from server
				queryClient.setQueryData(
					HEALTH_RECORDS_KEYS.list(context.animalUuid),
					(old: HealthRecord[] | undefined) => {
						if (!old || !Array.isArray(old)) return old
						return old.map((r) => (r.uuid === context.optimisticRecord.uuid ? data : r))
					}
				)
			}
		},

		// ROLLBACK: If mutation fails, remove the optimistic record
		onError: (_err, _variables, context) => {
			if (context?.previousRecords && context?.animalUuid) {
				queryClient.setQueryData(
					HEALTH_RECORDS_KEYS.list(context.animalUuid),
					context.previousRecords
				)
			}
		},

		// SYNC: Always refetch to ensure consistency with server
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: HEALTH_RECORDS_KEYS.list(variables.healthRecord.animalUuid),
			})
			// Also invalidate animal queries to update health status
			queryClient.invalidateQueries({ queryKey: ['animals'] })
		},
	})
}

export const useUpdateHealthRecord = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ healthRecord, userUuid }: { healthRecord: HealthRecord; userUuid: string }) =>
			HealthRecordsService.updateHealthRecord(healthRecord, userUuid, farm?.uuid),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: HEALTH_RECORDS_KEYS.detail(variables.healthRecord.uuid || ''),
			})
			queryClient.invalidateQueries({
				queryKey: HEALTH_RECORDS_KEYS.list(variables.healthRecord.animalUuid),
			})
		},
	})
}

export const useDeleteHealthRecord = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ healthRecordUuid, userUuid }: { healthRecordUuid: string; userUuid: string }) =>
			HealthRecordsService.updateHealthRecordsStatus(healthRecordUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: HEALTH_RECORDS_KEYS.all })
		},
	})
}
