import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'
import { PageHeader } from '@/components/ui/PageHeader'

import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type { AnimalInformation } from './Animal.types'

import * as S from './Animal.styles'

export const Animal: FC = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation()

	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animal, setAnimal] = useState<AnimalInformation>(ANIMAL_INITIAL_STATE)

	const handleEditAnimal = () => {
		navigate(AppRoutes.EDIT_ANIMAL.replace(':animalUuid', animal.uuid))
	}

	const handleRemoveAnimal = async () => {
		await AnimalsService.deleteAnimal(animal.uuid, false)

		setModalData({
			open: true,
			title: 'Animal Removed',
			message: 'The animal has been removed successfully',
			onAccept: () => {
				setModalData(defaultModalData)
				navigate(AppRoutes.ANIMALS)
			},
		})
	}

	const handleRemoveRelation = (uuid: string) => {
		const updateParents = animal.relatedAnimals.parents.filter((related) => related.uuid !== uuid)
		const updateChildren = animal.relatedAnimals.children.filter((related) => related.uuid !== uuid)
		setAnimal((prev) => ({
			...prev,
			relatedAnimals: { parents: updateParents, children: updateChildren },
		}))
	}

	const handleRemoveHealthRecord = (uuid: string) => {
		const updateHealthRecords = animal.healthRecords.filter((record) => record.uuid !== uuid)
		setAnimal((prev) => ({ ...prev, healthRecords: updateHealthRecords }))
	}

	const handleRemoveProductionRecord = (uuid: string) => {
		const updateProductionRecords = animal.productionRecords.filter(
			(record) => record.uuid !== uuid
		)
		setAnimal((prev) => ({ ...prev, productionRecords: updateProductionRecords }))
	}

	const getInitialData = async () => {
		try {
			setLoading(true)
			const { pathname } = location
			const animalId = pathname.split('/').pop()

			const dbAnimal = await AnimalsService.getAnimal(animalId!)
			const dbHealthRecords = await HealthRecordsService.getHealthRecords(animalId!)
			const dbRelatedAnimals = await RelatedAnimalsService.getRelatedAnimals(animalId!)
			const dbProductionRecords = await ProductionRecordsService.getProductionRecords(animalId!)

			dbAnimal.weight = dbHealthRecords[dbHealthRecords.length - 1]?.weight ?? dbAnimal.weight
			dbAnimal.healthRecords = dbHealthRecords
			dbAnimal.productionRecords = dbProductionRecords
			if (dbRelatedAnimals.length !== 0) {
				dbAnimal.relatedAnimals = {
					parents: dbRelatedAnimals.filter((related) => related.parent.animalUuid !== animalId),
					children: dbRelatedAnimals.filter((related) => related.child.animalUuid !== animalId),
				}
			}
			setAnimal(dbAnimal)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'Ocurrió un error al obtener el animal',
				onAccept: () => defaultModalData,
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		getInitialData()
	}, [params.animalUuid])

	return (
		<>
			<PageHeader>Animal {animal.animalId}</PageHeader>
			<S.Container>
				<S.AnimalContainer>
					<S.InfoContainer>
						<S.CenterTitle>
							<S.Label>{t('animal.animalId')}</S.Label>
							{user && (
								<ActionButton
									title="Edit"
									icon="i-material-symbols-edit-square-outline"
									onClick={handleEditAnimal}
								/>
							)}
							{user && (
								<ActionButton
									title="Delete"
									icon="i-material-symbols-delete-outline"
									onClick={handleRemoveAnimal}
								/>
							)}
						</S.CenterTitle>
						<S.AnimalInfo>
							<div>
								<S.Label>ID</S.Label>
								<S.Value>{animal.animalId}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.species')}</S.Label>
								<S.Value>{t(`animal.speciesList.${animal.species.toLowerCase()}`)}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.breed')}</S.Label>
								<S.Value>{animal.breed}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.gender')}</S.Label>
								<S.Value>{animal.gender}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.color')}</S.Label>
								<S.Value>{animal.color}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.weight')}</S.Label>
								<S.Value>{animal.weight}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.birthDate')}</S.Label>
								<S.Value>{dayjs(animal.birthDate).format('MM/DD/YYYY')}</S.Value>
							</div>
							<div>
								<S.Label>{t('animal.purchaseDate')}</S.Label>
								<S.Value>{dayjs(animal.purchaseDate).format('MM/DD/YYYY')}</S.Value>
							</div>
							{animal.soldDate && (
								<div>
									<S.Label>{t('animal.soldDate')}</S.Label>
									<S.Value>{dayjs(animal.soldDate).format('MM/DD/YYYY')}</S.Value>
								</div>
							)}
							{animal.deathDate && (
								<div>
									<S.Label>{t('animal.deathDate')}</S.Label>
									<S.Value>{dayjs(animal.deathDate).format('MM/DD/YYYY')}</S.Value>
								</div>
							)}
						</S.AnimalInfo>
					</S.InfoContainer>

					<S.ImageContainer>
						<S.Image src={animal.picture} alt={animal.species} />
					</S.ImageContainer>
				</S.AnimalContainer>

				<HealthRecordsTable
					healthRecords={animal?.healthRecords || []}
					user={user}
					removeHealthRecord={handleRemoveHealthRecord}
				/>

				<S.InfoTableContainer>
					<ProductionRecordsTable
						productionRecords={animal?.productionRecords || []}
						user={user}
						removeProductionRecord={handleRemoveProductionRecord}
					/>

					<RelatedAnimalsTable
						title={t('animal.parentsTitle')}
						animals={animal?.relatedAnimals?.parents || []}
						user={user}
						type="parent"
						removeRelation={handleRemoveRelation}
					/>

					<RelatedAnimalsTable
						title={t('animal.childrenTitle')}
						animals={animal?.relatedAnimals?.children || []}
						user={user}
						type="child"
						removeRelation={handleRemoveRelation}
					/>
				</S.InfoTableContainer>
			</S.Container>
		</>
	)
}

const ANIMAL_INITIAL_STATE: AnimalInformation = {
	uuid: '',
	animalId: 0,
	species: 'Cow',
	breed: '',
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	status: true,
	relatedAnimals: {
		parents: [],
		children: [],
	},
	healthRecords: [],
	productionRecords: [],
	birthDate: undefined,
	purchaseDate: undefined,
	soldDate: undefined,
	deathDate: undefined,
}
