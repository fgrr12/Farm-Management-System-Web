import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { CardContainer } from '@/components/business/RelatedAnimals/CardContainer'
import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'

import { AnimalsService } from '@/services/animals'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type {
	DragSingularRelation,
	RelatedAnimalInformation,
	RelatedAnimalsList,
	RelatedAnimalsLists,
} from './RelatedAnimalsForm.types'

export const RelatedAnimalsForm: FC = () => {
	const { user } = useUserStore()
	const params = useParams()
	const { t } = useTranslation(['relatedAnimals'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animalsLists, setAnimalsLists] = useState<RelatedAnimalsLists>(INITIAL_ANIMALS_LISTS)
	const [relatedAnimals, setRelatedAnimals] = useState<RelatedAnimalsList[]>([])
	const [currentAnimal, setCurrentAnimal] = useState<RelatedAnimalInformation | null>(null)

	const removeRelationIfExists = async (
		firstAnimalUuid: string,
		secondAnimalUuid: string,
		firstType: DragSingularRelation,
		secondType: DragSingularRelation
	) => {
		const exist = relatedAnimals.find(
			(related) =>
				related[firstType].animalUuid === firstAnimalUuid &&
				related[secondType].animalUuid === secondAnimalUuid
		)

		if (exist) {
			await RelatedAnimalsService.deleteRelatedAnimal(exist.uuid)
		}
	}

	const buildRelation = (info: RelatedAnimalInformation, isChild: boolean) => ({
		animalUuid: info.uuid,
		animalId: info.animalId,
		breed: info.breed,
		relation:
			info.gender.toLowerCase() === Gender.FEMALE
				? isChild
					? Relation.DAUGHTER
					: Relation.MOTHER
				: isChild
					? Relation.SON
					: Relation.FATHER,
	})

	const handleAddRelatedAnimal = async (
		child: RelatedAnimalInformation,
		parent: RelatedAnimalInformation
	) => {
		await RelatedAnimalsService.setRelatedAnimal(
			{
				uuid: crypto.randomUUID(),
				child: buildRelation(child, true),
				parent: buildRelation(parent, false),
			},
			user!.uuid
		)
	}

	const getSourceAnimal = (uuid: string) =>
		animalsLists.animals.find((a) => a.uuid === uuid) ||
		animalsLists.parents.find((a) => a.uuid === uuid) ||
		animalsLists.children.find((a) => a.uuid === uuid)

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		return monitorForElements({
			async onDrop({ source, location }) {
				const destination = location.current.dropTargets[0]
				if (!destination) {
					return
				}
				const destinationLocation = destination.data.location
				const sourceLocation = source.data.location

				if (sourceLocation === destinationLocation) {
					return
				}

				const sourceAnimal = getSourceAnimal(source.data.pieceType as string)
				if (!sourceAnimal) return

				const sourceUuid = sourceAnimal.uuid
				const currentUuid = params.animalUuid as string

				const actions: any = {
					'1->0': async () => removeRelationIfExists(sourceUuid, currentUuid, 'parent', 'child'),
					'2->0': async () => removeRelationIfExists(sourceUuid, currentUuid, 'child', 'parent'),
					'0->1': async () => {
						await removeRelationIfExists(currentUuid, sourceUuid, 'parent', 'child')
						await handleAddRelatedAnimal(currentAnimal!, sourceAnimal)
					},
					'1->2': async () => {
						await removeRelationIfExists(currentUuid, sourceUuid, 'child', 'parent')
						await handleAddRelatedAnimal(currentAnimal!, sourceAnimal)
					},
					'0->2': async () => {
						await removeRelationIfExists(currentUuid, sourceUuid, 'child', 'parent')
						await handleAddRelatedAnimal(sourceAnimal, currentAnimal!)
					},
					'2->1': async () => {
						await removeRelationIfExists(currentUuid, sourceUuid, 'parent', 'child')
						await handleAddRelatedAnimal(sourceAnimal, currentAnimal!)
					},
				}

				const key = `${sourceLocation}->${destinationLocation}`
				if (actions[key]) {
					await actions[key]()
				}
			},
		})
	}, [animalsLists])

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
						const animals = await AnimalsService.getAnimals({
							speciesUuid: selectedAnimal.species.uuid,
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
								location: 0,
							}))

						const parents = animals
							.filter((animal) =>
								data.some(
									(related) =>
										related.parent.animalUuid === animal.uuid &&
										related.child.animalUuid === animalUuid
								)
							)
							.map((animal) => ({
								uuid: animal.uuid,
								animalId: animal.animalId,
								breed: animal.breed,
								gender: animal.gender,
								picture: animal.picture,
								location: 1,
							}))

						const children = animals
							.filter((animal) =>
								data.some(
									(related) =>
										related.child.animalUuid === animal.uuid &&
										related.parent.animalUuid === animalUuid
								)
							)
							.map((animal) => ({
								uuid: animal.uuid,
								animalId: animal.animalId,
								breed: animal.breed,
								gender: animal.gender,
								picture: animal.picture,
								location: 2,
							}))

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
		<div className="flex justify-center align-center flex-col gap-4 sm:flex-row p-4 w-full">
			<CardContainer title="Animals" location={0}>
				{animalsLists.animals.map((animal) => (
					<RelatedAnimalCard key={animal.animalId} animal={animal} draggable />
				))}
			</CardContainer>
			<CardContainer title={t('parentsTitle')} location={1}>
				{animalsLists.parents.map((animal) => (
					<RelatedAnimalCard key={animal.animalId} animal={animal} draggable />
				))}
			</CardContainer>
			<CardContainer title={t('childrenTitle')} location={2}>
				{animalsLists.children.map((animal) => (
					<RelatedAnimalCard key={animal.animalId} animal={animal} draggable />
				))}
			</CardContainer>
		</div>
	)
}

const INITIAL_ANIMALS_LISTS: RelatedAnimalsLists = {
	animals: [],
	parents: [],
	children: [],
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
