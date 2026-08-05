import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { withOfflineQueue } from '@/utils/offlineQueue'

import { HealthRecordsService } from '@/services/healthRecords'

import type { HealthRecord } from '@/types'

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
		// Bypass TanStack Query's own online/offline pausing — withOfflineQueue inside
		// mutationFn already handles offline, and 'online' mode would pause before it runs.
		networkMode: 'always',
		mutationFn: ({ healthRecord, userUuid }: { healthRecord: HealthRecord; userUuid: string }) => {
			const farmUuid = farm?.uuid
			return withOfflineQueue(
				async () => ({
					...(await HealthRecordsService.setHealthRecord(healthRecord, userUuid, farmUuid)),
					pendingSync: false,
				}),
				() => ({ uuid: crypto.randomUUID(), isNew: true, pendingSync: true }),
				'createHealthRecord',
				{ healthRecord, userUuid, farmUuid }
			)
		},

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
				pendingSync: !navigator.onLine,
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

		// SUCCESS: Replace temporary ID with real ID from server (keeps the rest of the
		// optimistic record's fields — the API only echoes back {uuid, isNew})
		onSuccess: (data, _variables, context) => {
			if (context?.optimisticRecord && context?.animalUuid && data?.uuid) {
				queryClient.setQueryData(
					HEALTH_RECORDS_KEYS.list(context.animalUuid),
					(old: HealthRecord[] | undefined) => {
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
		networkMode: 'always',
		mutationFn: ({ healthRecord, userUuid }: { healthRecord: HealthRecord; userUuid: string }) =>
			withOfflineQueue(
				async () => ({
					...(await HealthRecordsService.updateHealthRecord(healthRecord, userUuid, farm?.uuid)),
					pendingSync: false,
				}),
				() => ({ uuid: healthRecord.uuid || '', isNew: false, pendingSync: true }),
				'updateHealthRecord',
				{ healthRecord, userUuid, farmUuid: farm?.uuid }
			),
		// Flag the already-cached record as pending while offline — doesn't touch its other
		// fields, this mutation has no optimistic field merge (and no rollback) to begin with.
		onMutate: ({ healthRecord }) => {
			if (navigator.onLine) return
			queryClient.setQueryData(
				HEALTH_RECORDS_KEYS.list(healthRecord.animalUuid),
				(old: HealthRecord[] | undefined) =>
					old?.map((r) => (r.uuid === healthRecord.uuid ? { ...r, pendingSync: true } : r))
			)
			queryClient.setQueryData(
				HEALTH_RECORDS_KEYS.detail(healthRecord.uuid || ''),
				(old: HealthRecord | undefined) => (old ? { ...old, pendingSync: true } : old)
			)
		},
		onSuccess: (data, variables) => {
			queryClient.setQueryData(
				HEALTH_RECORDS_KEYS.list(variables.healthRecord.animalUuid),
				(old: HealthRecord[] | undefined) =>
					old?.map((r) =>
						r.uuid === variables.healthRecord.uuid ? { ...r, pendingSync: data.pendingSync } : r
					)
			)
			queryClient.setQueryData(
				HEALTH_RECORDS_KEYS.detail(variables.healthRecord.uuid || ''),
				(old: HealthRecord | undefined) => (old ? { ...old, pendingSync: data.pendingSync } : old)
			)
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
