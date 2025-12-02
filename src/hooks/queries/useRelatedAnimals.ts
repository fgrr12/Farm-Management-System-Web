import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { RelatedAnimalsService } from '@/services/relatedAnimals'

export const RELATED_ANIMALS_KEYS = {
	all: ['relatedAnimals'] as const,
	organized: (animalUuid: string) =>
		[...RELATED_ANIMALS_KEYS.all, 'organized', animalUuid] as const,
}

export const useRelatedAnimals = (animalUuid: string) => {
	return useQuery({
		queryKey: RELATED_ANIMALS_KEYS.organized(animalUuid),
		queryFn: () => RelatedAnimalsService.getOrganizedRelatedAnimals(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useCreateRelatedAnimal = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ relation, userUuid }: { relation: Omit<Relation, 'uuid'>; userUuid: string }) =>
			RelatedAnimalsService.setRelatedAnimal(relation, userUuid, farm?.uuid || ''),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RELATED_ANIMALS_KEYS.all })
		},
	})
}

export const useDeleteRelatedAnimal = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ relationUuid, userUuid }: { relationUuid: string; userUuid: string }) =>
			RelatedAnimalsService.deleteRelatedAnimal(relationUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RELATED_ANIMALS_KEYS.all })
		},
	})
}
