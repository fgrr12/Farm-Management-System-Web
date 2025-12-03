import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { RelatedAnimalsService } from '@/services/relatedAnimals'

export const RELATED_ANIMALS_KEYS = {
	all: ['relatedAnimals'] as const,
	organized: (animalUuid: string) =>
		[...RELATED_ANIMALS_KEYS.all, 'organized', animalUuid] as const,
	list: (animalUuid: string) => [...RELATED_ANIMALS_KEYS.all, 'list', animalUuid] as const,
}

export const useRelatedAnimals = (animalUuid: string) => {
	return useQuery({
		queryKey: RELATED_ANIMALS_KEYS.organized(animalUuid),
		queryFn: () => RelatedAnimalsService.getOrganizedRelatedAnimals(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useRelatedAnimalsList = (animalUuid: string) => {
	return useQuery({
		queryKey: RELATED_ANIMALS_KEYS.list(animalUuid),
		queryFn: () => RelatedAnimalsService.getRelatedAnimals(animalUuid),
		enabled: !!animalUuid,
	})
}

export const useCreateRelatedAnimal = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ relation, userUuid }: { relation: Omit<Relation, 'uuid'>; userUuid: string }) =>
			RelatedAnimalsService.setRelatedAnimal(relation, userUuid, farm?.uuid || ''),

		// OPTIMISTIC UPDATE
		onMutate: async ({ relation }) => {
			// The relation object contains 'child' and 'parent' objects.
			// We need to know which animal's list we are updating.
			// Typically, we are viewing the form for ONE animal, and adding a relation to it.
			// The form usually knows the context (animalUuid).
			// However, the mutation doesn't explicitly take the context animalUuid, it's inside the relation.
			// We'll try to update the lists for both the child and the parent if they are currently cached.

			const childUuid = relation.child.animalUuid
			const parentUuid = relation.parent.animalUuid

			await queryClient.cancelQueries({ queryKey: RELATED_ANIMALS_KEYS.all })

			const previousData = queryClient.getQueriesData({ queryKey: RELATED_ANIMALS_KEYS.all })

			// Helper to update a specific list
			const updateList = (animalUuid: string, newRelation: Relation) => {
				queryClient.setQueryData(
					RELATED_ANIMALS_KEYS.list(animalUuid),
					(old: Relation[] | undefined) => {
						if (!old) return [newRelation]
						return [...old, newRelation]
					}
				)
			}

			// Create optimistic relation object
			// We need to construct a full Relation object.
			// The input 'relation' has child and parent properties which match the Relation structure mostly.
			const optimisticRelation: Relation = {
				uuid: `temp-${Date.now()}`,
				child: relation.child,
				parent: relation.parent,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			updateList(childUuid, optimisticRelation)
			updateList(parentUuid, optimisticRelation)

			return { previousData }
		},

		onError: (_err, _variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
		},

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

		onMutate: async ({ relationUuid }) => {
			await queryClient.cancelQueries({ queryKey: RELATED_ANIMALS_KEYS.all })
			const previousData = queryClient.getQueriesData({ queryKey: RELATED_ANIMALS_KEYS.all })

			// Remove from all lists
			queryClient.setQueriesData({ queryKey: RELATED_ANIMALS_KEYS.all }, (old: any) => {
				if (!Array.isArray(old)) return old
				return old.filter((r: Relation) => r.uuid !== relationUuid)
			})

			return { previousData }
		},

		onError: (_err, _variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RELATED_ANIMALS_KEYS.all })
		},
	})
}
