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
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: HEALTH_RECORDS_KEYS.list(variables.healthRecord.animalUuid),
			})
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
