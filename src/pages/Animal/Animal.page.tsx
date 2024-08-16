import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'

import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { AnimalInformation } from './Animal.types'

import { HealthRecordsCards } from '@/components/business/Animal/HealthRecordsCards'
import { ProductionRecordsCards } from '@/components/business/Animal/ProductionRecordsCards'
import { RelatedAnimalsCards } from '@/components/business/Animal/RelatedAnimalsCards'
import { FarmsService } from '@/services/farms'
import * as S from './Animal.styles'

export const Animal: FC = () => {
	const { user } = useUserStore()
	const { farm, setFarm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animal'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animal, setAnimal] = useState<AnimalInformation>(ANIMAL_INITIAL_STATE)
	const [mobile, setMobile] = useState(false)

	const handleEditAnimal = () => {
		navigate(AppRoutes.EDIT_ANIMAL.replace(':animalUuid', animal.uuid))
	}

	const handleRemoveAnimal = async () => {
		setModalData({
			open: true,
			title: t('modal.removeAnimal.title'),
			message: t('modal.removeAnimal.message'),
			onAccept: async () => {
				setLoading(true)
				await AnimalsService.deleteAnimal(animal.uuid, false)
				setModalData(defaultModalData)
				setLoading(false)
			},
			onCancel: () => setModalData(defaultModalData),
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

			if (!farm) {
				const farmData = await FarmsService.getFarm(dbAnimal!.farmUuid)
				setFarm(farmData)
			}

			setHeaderTitle(`Animal ${dbAnimal.animalId}`)
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
				title: t('modal.errorGettingAnimal.title'),
				message: t('modal.errorGettingAnimal.message'),
				onAccept: () => defaultModalData,
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setMobile(window.innerWidth <= 768)
		setHeaderTitle('Animal')
		getInitialData()
	}, [params.animalUuid])

	return (
		<S.Container>
			<S.AnimalContainer>
				<S.InfoContainer>
					<S.CenterTitle>
						<S.Label>{t('animalId')}</S.Label>
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
							<S.Label>{t('species')}</S.Label>
							<S.Value>{animal.species}</S.Value>
						</div>
						<div>
							<S.Label>{t('breed')}</S.Label>
							<S.Value>{animal.breed}</S.Value>
						</div>
						<div>
							<S.Label>{t('gender')}</S.Label>
							<S.Value>{t(`genderList.${animal.gender.toLowerCase()}`)}</S.Value>
						</div>
						<div>
							<S.Label>{t('color')}</S.Label>
							<S.Value>{animal.color}</S.Value>
						</div>
						<div>
							<S.Label>{t('weight')}</S.Label>
							<S.Value>
								{animal.weight}
								{farm?.weightUnit}
							</S.Value>
						</div>
						<div>
							<S.Label>{t('birthDate')}</S.Label>
							<S.Value>{dayjs(animal.birthDate).format('MM/DD/YYYY')}</S.Value>
						</div>
						<div>
							<S.Label>{t('purchaseDate')}</S.Label>
							<S.Value>{dayjs(animal.purchaseDate).format('MM/DD/YYYY')}</S.Value>
						</div>
						{animal.soldDate && (
							<div>
								<S.Label>{t('soldDate')}</S.Label>
								<S.Value>{dayjs(animal.soldDate).format('MM/DD/YYYY')}</S.Value>
							</div>
						)}
						{animal.deathDate && (
							<div>
								<S.Label>{t('deathDate')}</S.Label>
								<S.Value>{dayjs(animal.deathDate).format('MM/DD/YYYY')}</S.Value>
							</div>
						)}
					</S.AnimalInfo>
				</S.InfoContainer>

				<S.ImageContainer>
					<S.Image src={animal.picture} alt={animal.species} />
				</S.ImageContainer>
			</S.AnimalContainer>

			{mobile ? (
				<HealthRecordsCards
					healthRecords={animal?.healthRecords || []}
					user={user}
					removeHealthRecord={handleRemoveHealthRecord}
				/>
			) : (
				<HealthRecordsTable
					healthRecords={animal?.healthRecords || []}
					user={user}
					removeHealthRecord={handleRemoveHealthRecord}
				/>
			)}

			<S.InfoTableContainer>
				{mobile ? (
					<ProductionRecordsCards
						productionRecords={animal?.productionRecords || []}
						user={user}
						removeProductionRecord={handleRemoveProductionRecord}
					/>
				) : (
					<ProductionRecordsTable
						productionRecords={animal?.productionRecords || []}
						user={user}
						removeProductionRecord={handleRemoveProductionRecord}
					/>
				)}

				{mobile ? (
					<>
						<RelatedAnimalsCards
							title={t('parentsTitle')}
							animals={animal?.relatedAnimals?.parents || []}
							user={user}
							type="parent"
							removeRelation={handleRemoveRelation}
						/>
						<RelatedAnimalsCards
							title={t('childrenTitle')}
							animals={animal?.relatedAnimals?.children || []}
							user={user}
							type="child"
							removeRelation={handleRemoveRelation}
						/>
					</>
				) : (
					<>
						<RelatedAnimalsTable
							title={t('parentsTitle')}
							animals={animal?.relatedAnimals?.parents || []}
							user={user}
							type="parent"
							removeRelation={handleRemoveRelation}
						/>
						<RelatedAnimalsTable
							title={t('childrenTitle')}
							animals={animal?.relatedAnimals?.children || []}
							user={user}
							type="child"
							removeRelation={handleRemoveRelation}
						/>
					</>
				)}
			</S.InfoTableContainer>
		</S.Container>
	)
}

const ANIMAL_INITIAL_STATE: AnimalInformation = {
	uuid: '',
	animalId: '0',
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
