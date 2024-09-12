import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'

import { AnimalsService } from '@/services/animals'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type {
	DragRelationTypes,
	DragSingularRelation,
	RelatedAnimalInformation,
	RelatedAnimalsList,
	RelatedAnimalsLists,
} from './RelatedAnimalsForm.types'

import * as S from './RelatedAnimalsForm.styles'

export const RelatedAnimalsForm: FC = () => {
	const { user } = useUserStore()
	const params = useParams()
	const { t } = useTranslation(['relatedAnimals'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const dragItem: any = useRef()
	const dragOverItem: any = useRef()
	const [animalsLists, setAnimalsLists] = useState<RelatedAnimalsLists>(INITIAL_ANIMALS_LISTS)
	const [relatedAnimals, setRelatedAnimals] = useState<RelatedAnimalsList[]>([])
	const [currentAnimal, setCurrentAnimal] = useState<RelatedAnimalInformation | null>(null)

	const handleDragStart = (position: any, type: DragRelationTypes) => {
		dragItem.current = position
		dragItem.type = type
	}

	const handleDragEnter = (type: DragRelationTypes) => {
		dragOverItem.type = type
	}

	const handleDrop = async () => {
		if (dragItem.type === DragRelations.ANIMALS && dragOverItem.type) {
			const animal = animalsLists.animals.find((animal) => animal.uuid === dragItem.current)
			if (!animal) return

			if (dragOverItem.type === DragRelations.PARENTS) {
				await moveToRelations(animal.uuid, 'parent', 'child')
				await handleAddRelatedAnimal(currentAnimal!, animal)
			} else if (dragOverItem.type === DragRelations.CHILDREN) {
				await moveToRelations(animal.uuid, 'child', 'parent')
				await handleAddRelatedAnimal(animal, currentAnimal!)
			}
		}

		if (dragItem.type === DragRelations.PARENTS && dragOverItem.type === DragRelations.ANIMALS) {
			await moveToAnimals(dragItem.current, 'parent', 'child')
		}

		if (dragItem.type === DragRelations.CHILDREN && dragOverItem.type === DragRelations.ANIMALS) {
			await moveToAnimals(dragItem.current, 'child', 'parent')
		}
	}

	const moveToAnimals = async (
		dragItemUuid: string,
		firstType: DragSingularRelation,
		secondType: DragSingularRelation
	) => {
		const animalUuid = params.animalUuid as string
		const exist = relatedAnimals.find(
			(related) =>
				related[firstType].animalUuid === dragItemUuid &&
				related[secondType].animalUuid === animalUuid
		)
		if (exist) {
			await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
		}
	}

	const moveToRelations = async (
		relatedAnimalUuid: string,
		firstType: DragSingularRelation,
		secondType: DragSingularRelation
	) => {
		const animalUuid = params.animalUuid as string
		const exist = relatedAnimals.find(
			(related) =>
				related[firstType].animalUuid === animalUuid &&
				related[secondType].animalUuid === relatedAnimalUuid
		)
		if (exist) {
			await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
		}
	}

	const handleAddRelatedAnimal = async (
		child: RelatedAnimalInformation,
		parent: RelatedAnimalInformation
	) => {
		await RelatedAnimalsService.setRelatedAnimal(
			{
				uuid: crypto.randomUUID(),
				child: {
					animalUuid: child.uuid,
					animalId: child.animalId,
					breed: child.breed,
					relation: child.gender.toLowerCase() === Gender.FEMALE ? Relation.DAUGHTER : Relation.SON,
				},
				parent: {
					animalUuid: parent.uuid,
					animalId: parent.animalId,
					breed: parent.breed,
					relation:
						parent.gender.toLowerCase() === Gender.FEMALE ? Relation.MOTHER : Relation.FATHER,
				},
			},
			user!.uuid
		)
	}

	const handleClicDropzone = (type: DragRelationTypes) => {
		handleDragEnter(type)
		dragItem.type !== dragOverItem.type && handleDrop()
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (!user) return
		let unsubscribe: (() => void) | undefined

		const initialData = async () => {
			try {
				setLoading(true)
				const animalUuid = params.animalUuid as string
				const selectedAnimal = await AnimalsService.getAnimal(animalUuid)

				setCurrentAnimal({
					uuid: selectedAnimal.uuid,
					animalId: selectedAnimal.animalId,
					breed: selectedAnimal.breed,
					gender: selectedAnimal.gender,
				})
				unsubscribe = RelatedAnimalsService.getRealTimeRelatedAnimals(
					animalUuid,
					async (data) => {
						console.log(data)

						const animals = await AnimalsService.getAnimals({
							selectedSpecies: selectedAnimal.species,
							search: '',
							farmUuid: user!.farmUuid,
						})
						const animalsData = animals
							.filter(
								(animal) =>
									animal.uuid !== animalUuid &&
									!data.some(
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

						const parents = animals.filter((animal) =>
							data.some(
								(related) =>
									related.parent.animalUuid === animal.uuid &&
									related.child.animalUuid === animalUuid
							)
						)

						const children = animals.filter((animal) =>
							data.some(
								(related) =>
									related.child.animalUuid === animal.uuid &&
									related.parent.animalUuid === animalUuid
							)
						)

						setRelatedAnimals(data)
						setAnimalsLists({
							animals: animalsData,
							parents,
							children,
						})
					},
					(error) => console.error('Error fetching related animals: ', error)
				)
			} catch (error) {
				setModalData({
					...defaultModalData,
					open: true,
					title: t('modal.errorGettingAnimals.title'),
					message: t('modal.errorGettingAnimals.message'),
					onAccept: () => setModalData({ ...defaultModalData }),
				})
			} finally {
				setLoading(false)
			}
		}

		initialData()

		return () => {
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [user])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
	return (
		<S.Container>
			<S.AnimalsContainer
				onDragEnter={() => handleDragEnter(DragRelations.ANIMALS)}
				onClick={() => handleClicDropzone(DragRelations.ANIMALS)}
			>
				{animalsLists.animals.map((animal) => (
					<RelatedAnimalCard
						key={animal.animalId}
						animalId={animal.animalId}
						breed={animal.breed.name}
						gender={animal.gender}
						picture={animal.picture}
						draggable
						onDragStart={() => handleDragStart(animal.uuid, DragRelations.ANIMALS)}
						onDragEnd={handleDrop}
						onClick={() => handleDragStart(animal.uuid, DragRelations.ANIMALS)}
					/>
				))}
			</S.AnimalsContainer>
			<S.RelatedAnimalsContainer>
				<div>
					<S.Title>{t('parentsTitle')}</S.Title>
					<S.DragZone
						onDragEnter={() => handleDragEnter(DragRelations.PARENTS)}
						onClick={() => handleClicDropzone(DragRelations.PARENTS)}
					>
						{animalsLists.parents.map((animal) => (
							<RelatedAnimalCard
								key={animal.animalId}
								animalId={animal.animalId}
								breed={animal.breed.name}
								gender={animal.gender}
								picture={animal.picture}
								draggable
								onDragStart={() => handleDragStart(animal.uuid, DragRelations.PARENTS)}
								onDragEnd={handleDrop}
								onClick={() => handleDragStart(animal.uuid, DragRelations.PARENTS)}
							/>
						))}
					</S.DragZone>
				</div>
				<div>
					<S.Title>{t('childrenTitle')}</S.Title>
					<S.DragZone
						onDragEnter={() => handleDragEnter(DragRelations.CHILDREN)}
						onClick={() => handleClicDropzone(DragRelations.CHILDREN)}
					>
						{animalsLists.children.map((animal) => (
							<RelatedAnimalCard
								key={animal.animalId}
								animalId={animal.animalId}
								breed={animal.breed.name}
								gender={animal.gender}
								picture={animal.picture}
								draggable
								onDragStart={() => handleDragStart(animal.uuid, DragRelations.CHILDREN)}
								onDragEnd={handleDrop}
								onClick={() => handleDragStart(animal.uuid, DragRelations.CHILDREN)}
							/>
						))}
					</S.DragZone>
				</div>
			</S.RelatedAnimalsContainer>
		</S.Container>
	)
}

const INITIAL_ANIMALS_LISTS: RelatedAnimalsLists = {
	animals: [],
	parents: [],
	children: [],
}

enum DragRelations {
	ANIMALS = 'animals',
	PARENTS = 'parents',
	CHILDREN = 'children',
}

enum Gender {
	FEMALE = 'female',
	MALE = 'male',
}

enum Relation {
	MOTHER = 'Mother',
	FATHER = 'Father',
	SON = 'Son',
	DAUGHTER = 'Daughter',
}
