import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as S from './AddRelatedAnimals.styles'
import type { RelatedAnimalsLists } from './AddRelatedAnimals.types'

export const AddRelatedAnimals: FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	// const { t } = useTranslation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const dragItem: any = useRef()
	const dragOverItem: any = useRef()
	const [animalsLists, setAnimalsLists] = useState<RelatedAnimalsLists>(INITIAL_ANIMALS_LISTS)

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
			setRelatedToAnimal('parent')
		}

		if (dragItem.type === 'child' && dragOverItem.type === 'animal') {
			setRelatedToAnimal('children')
		}
	}

	const setRelatedToAnimal = async (animalArray: 'children' | 'parent') => {
		const animal = animalsLists[animalArray].find((animal) => animal.uuid === dragItem.current)

		if (!animal) return

		console.log(animal)

		setAnimalsLists((prev) => ({
			...prev,
			animals: [...prev.animals, animal],
			[animalArray]: prev[animalArray].filter((value) => value.uuid !== dragItem.current),
		}))
	}

	const getAnimals = async () => {
		try {
			setLoading(true)
			const animalUuid = location.pathname.split('/').pop() ?? ''
			const animals = await AnimalsService.getAnimals({
				selectedSpecies: 'all',
				search: '',
			})

			const animalsData = animals.map((animal) => ({
				uuid: animal.uuid,
				animalId: animal.animalId,
				breed: animal.breed,
				gender: animal.gender,
				picture: animal.picture,
			}))

			setAnimalsLists({
				animalUuid,
				animals: animalsData,
				parent: [],
				children: [],
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimals()
	}, [])
	return (
		<S.Container>
			<PageHeader onBack={handleBack}>Add Related Animals</PageHeader>
			<S.AnimalsContainer onDragEnter={() => handleDragEnter('animal')}>
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
					/>
				))}
			</S.AnimalsContainer>
			<S.RelatedAnimalsContainer>
				<div>
					<S.Title>Parents</S.Title>
					<S.DragZone onDragEnter={() => handleDragEnter('parent')}>
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
							/>
						))}
					</S.DragZone>
				</div>
				<div>
					<S.Title>Children</S.Title>
					<S.DragZone onDragEnter={() => handleDragEnter('child')}>
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
