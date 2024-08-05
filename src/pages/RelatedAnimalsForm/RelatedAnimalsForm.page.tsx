import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'
import { PageHeader } from '@/components/ui/PageHeader'

import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'

import type {
	RelatedAnimalInformation,
	RelatedAnimalsList,
	RelatedAnimalsLists,
} from './RelatedAnimalsForm.types'

import * as S from './RelatedAnimalsForm.styles'

export const RelatedAnimalsForm: FC = () => {
	const navigate = useNavigate()
	const params = useParams()
	// const { t } = useTranslation()

	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const dragItem: any = useRef()
	const dragOverItem: any = useRef()
	const [animalsLists, setAnimalsLists] = useState<RelatedAnimalsLists>(INITIAL_ANIMALS_LISTS)
	const [animalsRelated, setAnimalsRelated] = useState<RelatedAnimalsList[]>([])
	const [currentAnimal, setCurrentAnimal] = useState<RelatedAnimalInformation | null>(null)

	const handleBack = () => {
		navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalsLists.animalUuid))
	}

	const handleDragStart = (position: any, type: DragType) => {
		dragItem.current = position
		dragItem.type = type
	}

	const handleDragEnter = (type: DragType) => {
		dragOverItem.type = type
	}

	const handleDrop = async () => {
		if (dragItem.type === 'animal' && dragOverItem.type) {
			const animal = animalsLists.animals.find((animal) => animal.uuid === dragItem.current)
			if (!animal) return

			if (dragOverItem.type === 'parent') {
				if (!animalsLists.parent.includes(animal)) {
					setAnimalsLists((prev) => ({
						...prev,
						parent: [...prev.parent, animal],
					}))
					const exist = animalsRelated.find(
						(related) =>
							related.parent.animalUuid === animalsLists.animalUuid &&
							related.child.animalUuid === animal.uuid
					)
					if (exist) {
						await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
					}
					await RelatedAnimalsService.setRelatedAnimal({
						uuid: crypto.randomUUID(),
						child: {
							animalUuid: animalsLists.animalUuid,
							animalId: currentAnimal!.animalId,
							breed: currentAnimal!.breed,
							relation: currentAnimal!.gender.toLowerCase() === 'female' ? 'Daughter' : 'Son',
						},
						parent: {
							animalUuid: animal.uuid,
							animalId: animal.animalId,
							breed: animal.breed,
							relation: animal.gender.toLowerCase() === 'female' ? 'Mother' : 'Father',
						},
					})
				}
				setAnimalsLists((prev) => ({
					...prev,
					children: prev.children.filter((child) => child.uuid !== dragItem.current),
				}))
			} else if (dragOverItem.type === 'child') {
				if (!animalsLists.children.includes(animal)) {
					setAnimalsLists((prev) => ({
						...prev,
						children: [...prev.children, animal],
					}))
					const exist = animalsRelated.find(
						(related) =>
							related.child.animalUuid === animalsLists.animalUuid &&
							related.parent.animalUuid === animal.uuid
					)
					if (exist) {
						await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
					}
					await RelatedAnimalsService.setRelatedAnimal({
						uuid: crypto.randomUUID(),
						child: {
							animalUuid: animal.uuid,
							animalId: animal.animalId,
							breed: animal.breed,
							relation: animal.gender.toLowerCase() === 'female' ? 'Daughter' : 'Son',
						},
						parent: {
							animalUuid: animalsLists.animalUuid,
							animalId: currentAnimal!.animalId,
							breed: currentAnimal!.breed,
							relation: currentAnimal!.gender.toLowerCase() === 'female' ? 'Mother' : 'Father',
						},
					})
				}
				setAnimalsLists((prev) => ({
					...prev,
					parent: prev.parent.filter((parent) => parent.uuid !== dragItem.current),
				}))
			}

			setAnimalsLists((prev) => ({
				...prev,
				animals: prev.animals.filter((animal) => animal.uuid !== dragItem.current),
			}))
		}

		if (dragItem.type === 'parent' && dragOverItem.type === 'animal') {
			const exist = animalsRelated.find(
				(related) =>
					related.parent.animalUuid === dragItem.current &&
					related.child.animalUuid === animalsLists.animalUuid
			)
			if (exist) {
				await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
			}
			setRelatedToAnimal('parent')
		}

		if (dragItem.type === 'child' && dragOverItem.type === 'animal') {
			const exist = animalsRelated.find(
				(related) =>
					related.child.animalUuid === dragItem.current &&
					related.parent.animalUuid === animalsLists.animalUuid
			)
			if (exist) {
				await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
			}
			await RelatedAnimalsService.deleteRelatedAnimal(
				animalsRelated.find((related) => related.child.animalUuid === dragItem.current)!.uuid
			)
			setRelatedToAnimal('children')
		}
	}

	const handleClicDropzone = (type: DragType) => {
		handleDragEnter(type)
		dragItem.type !== dragOverItem.type && handleDrop()
	}

	const setRelatedToAnimal = (animalArray: 'children' | 'parent') => {
		const animal = animalsLists[animalArray].find((animal) => animal.uuid === dragItem.current)

		if (!animal) return

		setAnimalsLists((prev) => ({
			...prev,
			animals: [...prev.animals, animal],
			[animalArray]: prev[animalArray].filter((value) => value.uuid !== dragItem.current),
		}))
	}

	const getAnimals = async () => {
		try {
			setLoading(true)
			const animalUuid = params.animalUuid as string
			const relatedAnimals = await RelatedAnimalsService.getRelatedAnimals(animalUuid)
			const animals = await AnimalsService.getAnimals({
				selectedSpecies: 'all',
				search: '',
			})

			const animalsData = animals
				.filter((animal) => animal.uuid !== animalUuid)
				.filter(
					(animal) =>
						!relatedAnimals.some(
							(related) =>
								related.child.animalUuid === animal.uuid ||
								related.parent.animalUuid === animal.uuid
						)
				)
				.map((animal) => ({
					uuid: animal.uuid,
					animalId: animal.animalId,
					breed: animal.breed,
					gender: animal.gender,
					picture: animal.picture,
				}))
			setAnimalsRelated(relatedAnimals)
			const selectedAnimal = animals.find((animal) => animal.uuid === animalUuid)
			setCurrentAnimal({
				uuid: selectedAnimal!.uuid,
				animalId: selectedAnimal!.animalId,
				breed: selectedAnimal!.breed,
				gender: selectedAnimal!.gender,
			})
			setAnimalsLists({
				animalUuid,
				animals: animalsData,
				parent: animals.filter((animal) =>
					relatedAnimals.some(
						(related) =>
							related.parent.animalUuid === animal.uuid && related.child.animalUuid === animalUuid
					)
				),
				children: animals.filter((animal) =>
					relatedAnimals.some(
						(related) =>
							related.child.animalUuid === animal.uuid && related.parent.animalUuid === animalUuid
					)
				),
			})
		} catch (error) {
			setModalData({
				...defaultModalData,
				open: true,
				title: 'Error',
				message: 'An error occurred while fetching the animals',
				onAccept: () => setModalData({ ...defaultModalData }),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		getAnimals()
	}, [])
	return (
		<S.Container>
			<PageHeader onBack={handleBack}>Add Related Animals</PageHeader>
			<S.AnimalsContainer
				onDragEnter={() => handleDragEnter('animal')}
				onClick={() => handleClicDropzone('animal')}
			>
				{animalsLists.animals.map((animal) => (
					<RelatedAnimalCard
						key={animal.animalId}
						animalId={animal.animalId}
						breed={animal.breed}
						gender={animal.gender}
						picture={animal.picture}
						draggable
						onDragStart={() => handleDragStart(animal.uuid, 'animal')}
						onDragEnd={handleDrop}
						onClick={() => handleDragStart(animal.uuid, 'animal')}
					/>
				))}
			</S.AnimalsContainer>
			<S.RelatedAnimalsContainer>
				<div>
					<S.Title>Parents</S.Title>
					<S.DragZone
						onDragEnter={() => handleDragEnter('parent')}
						onClick={() => handleClicDropzone('parent')}
					>
						{animalsLists.parent.map((animal) => (
							<RelatedAnimalCard
								key={animal.animalId}
								animalId={animal.animalId}
								breed={animal.breed}
								gender={animal.gender}
								picture={animal.picture}
								draggable
								onDragStart={() => handleDragStart(animal.uuid, 'parent')}
								onDragEnd={handleDrop}
								onClick={() => handleDragStart(animal.uuid, 'parent')}
							/>
						))}
					</S.DragZone>
				</div>
				<div>
					<S.Title>Children</S.Title>
					<S.DragZone
						onDragEnter={() => handleDragEnter('child')}
						onClick={() => handleClicDropzone('child')}
					>
						{animalsLists.children.map((animal) => (
							<RelatedAnimalCard
								key={animal.animalId}
								animalId={animal.animalId}
								breed={animal.breed}
								gender={animal.gender}
								picture={animal.picture}
								draggable
								onDragStart={() => handleDragStart(animal.uuid, 'child')}
								onDragEnd={handleDrop}
								onClick={() => handleDragStart(animal.uuid, 'child')}
							/>
						))}
					</S.DragZone>
				</div>
			</S.RelatedAnimalsContainer>
		</S.Container>
	)
}

type DragType = 'animal' | 'parent' | 'child'

const INITIAL_ANIMALS_LISTS: RelatedAnimalsLists = {
	animalUuid: '',
	animals: [],
	parent: [],
	children: [],
}
