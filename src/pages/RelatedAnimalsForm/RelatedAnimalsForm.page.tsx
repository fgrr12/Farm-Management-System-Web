import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'
import { RelatedAnimalsService } from '@/services/relatedAnimals'

import { CardContainer } from '@/components/business/RelatedAnimals/CardContainer'
import { ExternalRelationForm } from '@/components/business/RelatedAnimals/ExternalRelationForm'
import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'
import { Button } from '@/components/ui/Button'

import type {
	DragSingularRelation,
	RelatedAnimalInformation,
	RelatedAnimalsLists,
} from './RelatedAnimalsForm.types'

const RelatedAnimalsForm = () => {
	const { user } = useUserStore()
	const { breeds } = useFarmStore()
	const params = useParams()
	const { t } = useTranslation(['relatedAnimals'])

	const { setLoading, setHeaderTitle, setToastData } = useAppStore()
	const [animalsLists, setAnimalsLists] = useState<RelatedAnimalsLists>(INITIAL_ANIMALS_LISTS)
	const [relatedAnimals, setRelatedAnimals] = useState<Relation[]>([])
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

	const buildRelation = (info: RelatedAnimalInformation, isChild: boolean): RelatedAnimal => ({
		animalUuid: info.uuid,
		animalId: info.animalId,
		breed: info.breed,
		relation:
			info.gender.toLowerCase() === GenderEnum.FEMALE
				? isChild
					? Relationship.DAUGHTER
					: Relationship.MOTHER
				: isChild
					? Relationship.SON
					: Relationship.FATHER,
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

	// biome-ignore lint:: UseEffect is only called once
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

	// biome-ignore lint:: UseEffect is only called once
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
					breed: breeds.find((breed) => breed.uuid === selectedAnimal.breedUuid)!.name,
					gender: selectedAnimal.gender,
					picture: selectedAnimal.picture,
					location: -1,
				})
				unsubscribe = RelatedAnimalsService.getRealTimeRelatedAnimals(
					animalUuid,
					async (data) => {
						const animals = await AnimalsService.getAnimalsBySpecies(
							selectedAnimal.speciesUuid,
							user!.farmUuid
						)
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
								breed: breeds.find((breed) => breed.uuid === animal.breedUuid)!.name,
								gender: animal.gender,
								picture: animal.picture,
								location: 0,
							}))

						const parents = data
							.filter((related) => animalUuid === related.child.animalUuid)
							.map((related) => ({
								uuid: related.parent.animalUuid,
								animalId: related.parent.animalId,
								breed:
									breeds.find((breed) => breed.uuid === related.parent.breed)!.name ??
									related.parent.breed,
								gender:
									related.parent.relation === Relationship.MOTHER
										? (GenderEnum.FEMALE as unknown as Gender)
										: (GenderEnum.MALE as unknown as Gender),
								picture: '',
								location: 1,
							}))

						const children = data
							.filter((related) => animalUuid === related.parent.animalUuid)
							.map((related) => ({
								uuid: related.child.animalUuid,
								animalId: related.child.animalId,
								breed:
									breeds.find((breed) => breed.uuid === related.child.breed)!.name ??
									related.child.breed,
								gender:
									related.child.relation === Relationship.DAUGHTER
										? (GenderEnum.FEMALE as unknown as Gender)
										: (GenderEnum.MALE as unknown as Gender),
								picture: '',
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
			} catch (_error) {
				setToastData({
					message: t('toast.errorGettingAnimals'),
					type: 'error',
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
		<div className="flex flex-col sm:grid sm:grid-cols-4 p-4 gap-4 sm:gap-6 w-full h-full">
			{currentAnimal && (
				<div className="flex flex-col gap-4 w-full h-full p-4">
					<div className="text-center text-2xl font-semibold">{t('selectedAnimal')}</div>
					<RelatedAnimalCard animal={currentAnimal} />
					<Button onClick={() => document?.querySelector('dialog')?.showModal()}>
						{t('addExternalRelation')}
					</Button>
				</div>
			)}
			<div className="h-[calc(100vh-100px)]">
				<CardContainer title={t('animals')} animals={animalsLists.animals} location={0} />
			</div>
			<div className="h-[calc(100vh-100px)]">
				<CardContainer title={t('parentsTitle')} animals={animalsLists.parents} location={1} />
			</div>
			<div className="h-[calc(100vh-100px)]">
				<CardContainer title={t('childrenTitle')} animals={animalsLists.children} location={2} />
			</div>
			{currentAnimal && <ExternalRelationForm currentAnimal={currentAnimal} />}
		</div>
	)
}

const INITIAL_ANIMALS_LISTS: RelatedAnimalsLists = {
	animals: [],
	parents: [],
	children: [],
}

enum GenderEnum {
	FEMALE = 'female',
	MALE = 'male',
}

enum Relationship {
	MOTHER = 'Mother',
	FATHER = 'Father',
	SON = 'Son',
	DAUGHTER = 'Daughter',
}

export default RelatedAnimalsForm
