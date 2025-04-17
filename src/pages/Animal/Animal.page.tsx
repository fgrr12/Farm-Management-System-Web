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
import { FarmsService } from '@/services/farms'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { RelatedAnimalsService } from '@/services/relatedAnimals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './Animal.styles'

export const Animal: FC = () => {
	const { user } = useUserStore()
	const { farm, setFarm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animal'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animal, setAnimal] = useState(ANIMAL_INITIAL_STATE)
	const [activeTab, setActiveTab] = useState<
		'healthRecords' | 'productionRecords' | 'relatedAnimals'
	>('healthRecords')

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
				navigate(AppRoutes.ANIMALS)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}

	const handleRemoveRelation = (uuid: string) => {
		const updateParents = animal.relatedAnimals!.parents.filter((related) => related.uuid !== uuid)
		const updateChildren = animal.relatedAnimals!.children.filter(
			(related) => related.uuid !== uuid
		)
		setAnimal((prev) => ({
			...prev,
			relatedAnimals: { parents: updateParents, children: updateChildren },
		}))
	}

	const handleRemoveHealthRecord = (uuid: string) => {
		const updateHealthRecords = animal.healthRecords!.filter((record) => record.uuid !== uuid)
		setAnimal((prev) => ({ ...prev, healthRecords: updateHealthRecords }))
	}

	const handleRemoveProductionRecord = (uuid: string) => {
		const updateProductionRecords = animal.productionRecords!.filter(
			(record) => record.uuid !== uuid
		)
		setAnimal((prev) => ({ ...prev, productionRecords: updateProductionRecords }))
	}

	const getHealthRecords = async () => {
		if (activeTab === 'healthRecords') return
		setActiveTab('healthRecords')
		const dbHealthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)
		animal.weight = dbHealthRecords[0]?.weight ?? animal.weight
		setAnimal((prev) => ({ ...prev, healthRecords: dbHealthRecords, weight: animal.weight }))
	}

	const getProductionRecords = async () => {
		if (activeTab === 'productionRecords') return
		setActiveTab('productionRecords')
		const dbProductionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
		setAnimal((prev) => ({ ...prev, productionRecords: dbProductionRecords }))
	}

	const getRelatedAnimals = async () => {
		if (activeTab === 'relatedAnimals') return
		setActiveTab('relatedAnimals')
		const dbRelatedAnimals = await RelatedAnimalsService.getRelatedAnimals(animal.uuid)
		if (dbRelatedAnimals.length !== 0) {
			setAnimal(
				(prev) =>
					({
						...prev,
						relatedAnimals: {
							parents: dbRelatedAnimals.filter(
								(related) => related.parent.animalUuid !== animal.uuid
							),
							children: dbRelatedAnimals.filter(
								(related) => related.child.animalUuid !== animal.uuid
							),
						},
					}) as Animal
			)
		}
	}

	const getInitialData = async () => {
		try {
			setLoading(true)
			const animalId = params.animalUuid as string

			const dbAnimal = await AnimalsService.getAnimal(animalId!)
			const dbHealthRecords = await HealthRecordsService.getHealthRecords(animalId!)

			if (!farm) {
				const farmData = await FarmsService.getFarm(dbAnimal!.farmUuid)
				setFarm(farmData)
			}

			setHeaderTitle(`Animal ${dbAnimal.animalId}`)
			const weight =
				dbHealthRecords.length > 0 && dbHealthRecords[0]!.weight! > 0
					? dbHealthRecords[0]!.weight
					: dbAnimal.weight
			dbAnimal.healthRecords = dbHealthRecords
			setAnimal({ ...dbAnimal, weight: weight! })
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorGettingAnimal.title'),
				message: t('modal.errorGettingAnimal.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Animal')
		farm && setActiveTab('healthRecords')
		farm && getInitialData()
	}, [params.animalUuid, farm])

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
							<S.Value>{animal.species.name}</S.Value>
						</div>
						<div>
							<S.Label>{t('breed')}</S.Label>
							<S.Value>{animal.breed.name}</S.Value>
						</div>
						<div>
							<S.Label>{t('gender')}</S.Label>
							<S.Value>
								{t(`genderList.${animal.gender.toLowerCase()}`)}
								<S.GenderIcon
									className={`i-mdi-gender-${animal.gender.toLowerCase()}`}
									$gender={animal.gender}
								/>
							</S.Value>
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
							<S.Value>{dayjs(animal.birthDate).format('DD/MM/YYYY')}</S.Value>
						</div>
						{animal.purchaseDate && (
							<div>
								<S.Label>{t('purchaseDate')}</S.Label>
								<S.Value>{dayjs(animal.purchaseDate).format('DD/MM/YYYY')}</S.Value>
							</div>
						)}
						{animal.soldDate && (
							<div>
								<S.Label>{t('soldDate')}</S.Label>
								<S.Value>{dayjs(animal.soldDate).format('DD/MM/YYYY')}</S.Value>
							</div>
						)}
						{animal.deathDate && (
							<div>
								<S.Label>{t('deathDate')}</S.Label>
								<S.Value>{dayjs(animal.deathDate).format('DD/MM/YYYY')}</S.Value>
							</div>
						)}
					</S.AnimalInfo>
				</S.InfoContainer>

				<S.ImageContainer>
					<S.Image
						src={animal.picture || '/assets/default-imgs/cow.svg'}
						alt={animal.species.name}
					/>
				</S.ImageContainer>
			</S.AnimalContainer>

			<S.TabsContainer>
				<S.Tabs>
					<S.Tab $active={activeTab === 'healthRecords'} onClick={getHealthRecords}>
						{t('healthRecords')}
					</S.Tab>
					<S.Tab $active={activeTab === 'productionRecords'} onClick={getProductionRecords}>
						{t('productionRecords')}
					</S.Tab>
					<S.Tab $active={activeTab === 'relatedAnimals'} onClick={getRelatedAnimals}>
						{t('relatedAnimals')}
					</S.Tab>
				</S.Tabs>
				{activeTab === 'healthRecords' && (
					<HealthRecordsTable
						healthRecords={animal?.healthRecords || []}
						haveUser={user !== null}
						farm={farm}
						removeHealthRecord={handleRemoveHealthRecord}
					/>
				)}
				{activeTab === 'productionRecords' && (
					<ProductionRecordsTable
						productionRecords={animal?.productionRecords || []}
						haveUser={user !== null}
						farm={farm}
						removeProductionRecord={handleRemoveProductionRecord}
					/>
				)}
				{activeTab === 'relatedAnimals' && (
					<>
						<RelatedAnimalsTable
							title={t('parentsTitle')}
							animals={animal?.relatedAnimals?.parents || []}
							haveUser={user !== null}
							type="parent"
							removeRelation={handleRemoveRelation}
						/>
						<RelatedAnimalsTable
							title={t('childrenTitle')}
							animals={animal?.relatedAnimals?.children || []}
							haveUser={user !== null}
							type="child"
							removeRelation={handleRemoveRelation}
						/>
					</>
				)}
			</S.TabsContainer>
		</S.Container>
	)
}

const ANIMAL_INITIAL_STATE: Animal = {
	uuid: '',
	animalId: '0',
	species: {
		uuid: '',
		name: '',
	},
	breed: {
		uuid: '',
		name: '',
		gestationPeriod: 0,
	},
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	status: true,
	farmUuid: '',
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
