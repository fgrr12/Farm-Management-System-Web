import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { withOfflineQueue } from '@/utils/offlineQueue'

import { AnimalsService } from '@/services/animals'

import type { Animal } from '@/types'

export const ANIMALS_KEYS = {
	all: ['animals'] as const,
	list: (farmUuid: string) => [...ANIMALS_KEYS.all, 'list', farmUuid] as const,
	detail: (animalUuid: string) => [...ANIMALS_KEYS.all, 'detail', animalUuid] as const,
}

export const useAnimals = () => {
	const { farm } = useFarmStore()
	const farmUuid = farm?.uuid

	return useQuery({
		queryKey: ANIMALS_KEYS.list(farmUuid || ''),
		queryFn: () => AnimalsService.getAnimals(farmUuid || ''),
		enabled: !!farmUuid,
	})
}

export const useAnimal = (animalUuid: string) => {
	return useQuery({
		queryKey: ANIMALS_KEYS.detail(animalUuid),
		queryFn: () => AnimalsService.getAnimal(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useCreateAnimal = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ animal, userUuid }: { animal: Animal; userUuid: string }) => {
			const farmUuid = farm?.uuid || ''
			return withOfflineQueue(
				async () => ({
					uuid: await AnimalsService.setAnimal(animal, userUuid, farmUuid),
					pendingSync: false,
				}),
				() => ({ uuid: crypto.randomUUID(), pendingSync: true }),
				'createAnimal',
				{ animal, userUuid, farmUuid }
			)
		},

		// OPTIMISTIC UPDATE: Add to list immediately with temporary ID
		onMutate: async ({ animal }) => {
			const farmUuid = farm?.uuid || ''

			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ANIMALS_KEYS.list(farmUuid) })

			// Snapshot the previous value
			const previousAnimals = queryClient.getQueryData(ANIMALS_KEYS.list(farmUuid))

			// Create optimistic animal with temporary ID
			const optimisticAnimal: Animal = {
				...animal,
				uuid: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				pendingSync: !navigator.onLine,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			// Optimistically update to the new value
			queryClient.setQueryData(ANIMALS_KEYS.list(farmUuid), (old: Animal[] | undefined) => {
				if (!old || !Array.isArray(old)) return [optimisticAnimal]
				return [optimisticAnimal, ...old]
			})

			// Return a context object with the snapshotted value
			return { previousAnimals, optimisticAnimal, farmUuid }
		},

		// SUCCESS: Replace temporary ID with real ID from server (or the local id if it got queued)
		onSuccess: (data, _variables, context) => {
			if (context?.optimisticAnimal && context?.farmUuid && data) {
				const realAnimal = {
					...context.optimisticAnimal,
					uuid: data.uuid,
					pendingSync: data.pendingSync,
				}
				queryClient.setQueryData(
					ANIMALS_KEYS.list(context.farmUuid),
					(old: Animal[] | undefined) => {
						if (!old || !Array.isArray(old)) return old
						return old.map((a) => (a.uuid === context.optimisticAnimal.uuid ? realAnimal : a))
					}
				)
			}
		},

		// ROLLBACK: If mutation fails, use the context returned from onMutate to roll back
		onError: (_err, _newAnimal, context) => {
			if (context?.previousAnimals && context?.farmUuid) {
				queryClient.setQueryData(ANIMALS_KEYS.list(context.farmUuid), context.previousAnimals)
			}
		},

		// SYNC: Always refetch after error or success
		onSettled: (_data, _error, _variables, context) => {
			if (context?.farmUuid) {
				queryClient.invalidateQueries({ queryKey: ANIMALS_KEYS.list(context.farmUuid) })
			}
		},
	})
}

export const useUpdateAnimal = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ animal, userUuid }: { animal: Animal; userUuid: string }) =>
			withOfflineQueue(
				async () => ({
					...(await AnimalsService.updateAnimal(animal, userUuid)),
					pendingSync: false,
				}),
				() => ({ uuid: animal.uuid, isNew: false, pendingSync: true }),
				'updateAnimal',
				{ animal, userUuid }
			),

		// OPTIMISTIC UPDATE: Update list and detail immediately
		onMutate: async ({ animal }) => {
			const farmUuid = farm?.uuid || ''
			const pendingSync = !navigator.onLine

			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ANIMALS_KEYS.list(farmUuid) })
			await queryClient.cancelQueries({ queryKey: ANIMALS_KEYS.detail(animal.uuid) })

			// Snapshot the previous values
			const previousAnimals = queryClient.getQueryData(ANIMALS_KEYS.list(farmUuid))
			const previousAnimal = queryClient.getQueryData(ANIMALS_KEYS.detail(animal.uuid))

			// Optimistically update list
			queryClient.setQueryData(ANIMALS_KEYS.list(farmUuid), (old: Animal[] | undefined) => {
				if (!old || !Array.isArray(old)) return old
				return old.map((a) => (a.uuid === animal.uuid ? { ...a, ...animal, pendingSync } : a))
			})

			// Optimistically update detail
			queryClient.setQueryData(ANIMALS_KEYS.detail(animal.uuid), (old: Animal | undefined) => {
				if (!old) return old
				return { ...old, ...animal, pendingSync }
			})

			// Return a context object with the snapshotted values
			return { previousAnimals, previousAnimal, farmUuid, animalUuid: animal.uuid }
		},

		// SUCCESS: correct the pendingSync flag once we actually know whether this went
		// through or got queued (onMutate only knows the connectivity at submit time)
		onSuccess: (data, variables) => {
			const farmUuid = farm?.uuid || ''
			queryClient.setQueryData(ANIMALS_KEYS.list(farmUuid), (old: Animal[] | undefined) =>
				old?.map((a) =>
					a.uuid === variables.animal.uuid ? { ...a, pendingSync: data.pendingSync } : a
				)
			)
			queryClient.setQueryData(
				ANIMALS_KEYS.detail(variables.animal.uuid),
				(old: Animal | undefined) => (old ? { ...old, pendingSync: data.pendingSync } : old)
			)
		},

		// ROLLBACK
		onError: (_err, _variables, context) => {
			if (context?.previousAnimals && context?.farmUuid) {
				queryClient.setQueryData(ANIMALS_KEYS.list(context.farmUuid), context.previousAnimals)
			}
			if (context?.previousAnimal && context?.animalUuid) {
				queryClient.setQueryData(ANIMALS_KEYS.detail(context.animalUuid), context.previousAnimal)
			}
		},

		// SYNC
		onSettled: (_data, _error, variables) => {
			const farmUuid = farm?.uuid || ''
			queryClient.invalidateQueries({ queryKey: ANIMALS_KEYS.list(farmUuid) })
			queryClient.invalidateQueries({ queryKey: ANIMALS_KEYS.detail(variables.animal.uuid) })
		},
	})
}
