import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { CardContainer } from '@/components/business/RelatedAnimals/CardContainer'
import type { ExternalRelationFormRef } from '@/components/business/RelatedAnimals/ExternalRelationForm'
import { ExternalRelationForm } from '@/components/business/RelatedAnimals/ExternalRelationForm'
import { RelatedAnimalCard } from '@/components/business/RelatedAnimals/RelatedAnimalCard'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'

import { useAnimals } from '@/hooks/queries/useAnimals'
import {
	useCreateRelatedAnimal,
	useDeleteRelatedAnimal,
	useRelatedAnimalsList,
} from '@/hooks/queries/useRelatedAnimals'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type {
	DragSingularRelation,
	RelatedAnimalInformation,
	RelatedAnimalsLists,
} from './RelatedAnimalsForm.types'

const RelatedAnimalsForm = () => {
	const { user } = useUserStore()
	const { farm, breeds } = useFarmStore()
	const params = useParams()
	const { t } = useTranslation(['relatedAnimals'])
	const { setPageTitle } = usePagePerformance()
	const externalFormRef = useRef<ExternalRelationFormRef>(null)

	const createRelatedAnimal = useCreateRelatedAnimal()
	const deleteRelatedAnimal = useDeleteRelatedAnimal()

	const { data: allAnimals = [] } = useAnimals()
	const { data: relatedAnimals = [] } = useRelatedAnimalsList(params.animalUuid as string)

	// Derive state from cached data
	const { animalsLists, currentAnimal } = useMemo(() => {
		const animalUuid = params.animalUuid as string
		const selectedAnimal = allAnimals.find((a) => a.uuid === animalUuid)

		if (!selectedAnimal || !farm) {
			return {
				animalsLists: INITIAL_ANIMALS_LISTS,
				currentAnimal: null,
			}
		}

		// Current Animal Info
		const breedObj = breeds.find((breed) => breed.uuid === selectedAnimal.breedUuid)
		const currentAnimalInfo: RelatedAnimalInformation = {
			uuid: selectedAnimal.uuid,
			animalId: selectedAnimal.animalId,
			breed: breedObj ? breedObj.name : '',
			gender: selectedAnimal.gender,
			picture: selectedAnimal.picture,
			location: -1,
		}

		// Filter Available Animals (Same Species, Not Self, Not Already Related)
		const availableAnimals = allAnimals
			.filter(
				(animal) =>
					animal.speciesUuid === selectedAnimal.speciesUuid &&
					animal.uuid !== animalUuid &&
					!relatedAnimals.some(
						(related) =>
							related.child.animalUuid === animal.uuid || related.parent.animalUuid === animal.uuid
					)
			)
			.map((animal) => ({
				uuid: animal.uuid,
				animalId: animal.animalId,
				breed: breeds.find((breed) => breed.uuid === animal.breedUuid)?.name || '',
				gender: animal.gender,
				picture: animal.picture,
				location: 0,
			}))

		// Parents
		const parents = relatedAnimals
			.filter((related) => animalUuid === related.child.animalUuid)
			.map((related) => {
				const breed = breeds.find((breed) => breed.uuid === related.parent.breed)
				return {
					uuid: related.parent.animalUuid,
					animalId: related.parent.animalId,
					breed: breed?.name ?? related.parent.breed,
					gender:
						related.parent.relation === Relationship.MOTHER
							? (GenderEnum.FEMALE as unknown as Gender)
							: (GenderEnum.MALE as unknown as Gender),
					picture: '',
					location: 1,
				}
			})

		// Children
		const children = relatedAnimals
			.filter((related) => animalUuid === related.parent.animalUuid)
			.map((related) => {
				const breed = breeds.find((breed) => breed.uuid === related.child.breed)
				return {
					uuid: related.child.animalUuid,
					animalId: related.child.animalId,
					breed: breed?.name ?? related.child.breed,
					gender:
						related.child.relation === Relationship.DAUGHTER
							? (GenderEnum.FEMALE as unknown as Gender)
							: (GenderEnum.MALE as unknown as Gender),
					picture: '',
					location: 2,
				}
			})

		return {
			animalsLists: {
				animals: availableAnimals,
				parents,
				children,
			},
			currentAnimal: currentAnimalInfo,
		}
	}, [allAnimals, relatedAnimals, params.animalUuid, farm, breeds])

	const removeRelationIfExists = useCallback(
		async (
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
				await deleteRelatedAnimal.mutateAsync({
					relationUuid: exist.uuid,
					userUuid: user!.uuid,
				})
			}
		},
		[user, relatedAnimals, deleteRelatedAnimal]
	)

	const buildRelation = useCallback(
		(info: RelatedAnimalInformation, isChild: boolean): RelatedAnimal => ({
			animalUuid: info.uuid,
			animalId: info.animalId,
			breed: breeds.find((breed) => breed.name === info.breed)?.uuid ?? '',
			relation:
				info.gender.toLowerCase() === GenderEnum.FEMALE
					? isChild
						? Relationship.DAUGHTER
						: Relationship.MOTHER
					: isChild
						? Relationship.SON
						: Relationship.FATHER,
		}),
		[breeds]
	)

	const handleAddRelatedAnimal = useCallback(
		async (child: RelatedAnimalInformation, parent: RelatedAnimalInformation) => {
			if (!user) return

			await createRelatedAnimal.mutateAsync({
				relation: {
					child: buildRelation(child, true),
					parent: buildRelation(parent, false),
				},
				userUuid: user.uuid,
			})
		},
		[user, buildRelation, createRelatedAnimal]
	)

	const getSourceAnimal = useCallback(
		(uuid: string) =>
			animalsLists.animals.find((a) => a.uuid === uuid) ||
			animalsLists.parents.find((a) => a.uuid === uuid) ||
			animalsLists.children.find((a) => a.uuid === uuid),
		[animalsLists]
	)

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

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer maxWidth="7xl">
			<PageHeader
				icon="family-restroom"
				title={t('title')}
				subtitle={t('subtitle')}
				variant="compact"
			/>

			{/* Main Content */}
			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
				id="main-content"
			>
				{currentAnimal && (
					<section
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl p-4 sm:p-6 flex flex-col gap-4"
						aria-labelledby="selected-animal-heading"
					>
						<div className="flex items-center gap-2 mb-4">
							<i className="i-material-symbols-pets bg-blue-600! dark:bg-blue-500! w-5! h-5!" />
							<h2
								id="selected-animal-heading"
								className="text-lg font-semibold text-gray-900 dark:text-gray-100"
							>
								{t('selectedAnimal')}
							</h2>
						</div>
						<div role="img" aria-label={t('accessibility.selectedAnimalCard')}>
							<RelatedAnimalCard animal={currentAnimal} />
						</div>
						<Button
							onClick={() => externalFormRef.current?.openModal()}
							aria-describedby="external-relation-description"
							className="btn btn-outline btn-primary flex items-center gap-2 dark:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
						>
							<i className="i-material-symbols-add-link w-4! h-4!" />
							{t('addExternalRelation')}
						</Button>
						<div id="external-relation-description" className="sr-only">
							{t('accessibility.addExternalRelationDescription')}
						</div>
					</section>
				)}

				<CardContainer
					title={t('animals')}
					animals={animalsLists.animals}
					location={0}
					icon="i-material-symbols-pets"
					iconColor="bg-green-600! dark:bg-green-500!"
					aria-label={t('accessibility.availableAnimalsContainer')}
				/>

				<CardContainer
					title={t('parentsTitle')}
					animals={animalsLists.parents}
					location={1}
					icon="i-material-symbols-family-restroom"
					iconColor="bg-purple-600! dark:bg-purple-500!"
					aria-label={t('accessibility.parentsContainer')}
				/>

				<CardContainer
					title={t('childrenTitle')}
					animals={animalsLists.children}
					location={2}
					icon="i-material-symbols-child-care"
					iconColor="bg-orange-600! dark:bg-orange-500!"
					aria-label={t('accessibility.childrenContainer')}
				/>

				{currentAnimal && (
					<ExternalRelationForm
						ref={externalFormRef}
						currentAnimal={currentAnimal}
						aria-label={t('accessibility.externalRelationForm')}
					/>
				)}
			</div>
		</PageContainer>
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

export default memo(RelatedAnimalsForm)
