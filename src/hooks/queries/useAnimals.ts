import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { AnimalsService } from '@/services/animals'

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
		mutationFn: (animal: Animal) =>
			AnimalsService.setAnimal(animal, 'user-uuid-placeholder', farm?.uuid || ''),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ANIMALS_KEYS.list(farm?.uuid || '') })
		},
	})
}
