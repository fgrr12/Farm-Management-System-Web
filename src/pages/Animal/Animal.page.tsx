import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'
import { FarmsService } from '@/services/farms'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { RelatedAnimalsService } from '@/services/relatedAnimals'

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'
import { EmployeesService } from '@/services/employees'

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex flex-col gap-1 w-full justify-center items-center">
		<span className="font-bold text-xl text-center">{label}</span>
		<span className="text-xl text-center">{value}</span>
	</div>
)

const GenderIcon = ({ gender }: { gender: string }) =>
	gender.toLowerCase() === 'male' ? (
		<i className="i-tdesign-gender-male bg-blue-500! w-5! h-5!" />
	) : (
		<i className="i-tdesign-gender-female bg-pink-500! w-5! h-5!" />
	)

const Animal = () => {
	const { user } = useUserStore()
	const { farm, setFarm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animal'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animal, setAnimal] = useState(ANIMAL_INITIAL_STATE)
	const [employees, setEmployees] = useState<User[]>([])
	const [activeTab, setActiveTab] = useState<
		'healthRecords' | 'productionRecords' | 'relatedAnimals'
	>('healthRecords')

	const handleEditAnimal = () => {
		navigate(AppRoutes.EDIT_ANIMAL.replace(':animalUuid', animal.uuid))
	}

	const buttonIcon = (key: string) => {
		switch (key) {
			case 'healthRecords':
				return 'i-material-symbols-light-health-metrics-rounded bg-emerald-500! w-7! h-7!'
			case 'productionRecords':
				return 'i-icon-park-outline-milk bg-gray-500! w-7! h-7!'
			case 'relatedAnimals':
				return 'i-tabler-circles-relation bg-yellow-500! w-7! h-7!'
			default:
				return ''
		}
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
		if (dbHealthRecords[0]?.weight! > 0) {
			animal.weight = dbHealthRecords[0]?.weight ?? animal.weight
		}
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

			if (user && farm) {
				setEmployees(await EmployeesService.getEmployees('', farm.uuid))
			}

			setHeaderTitle(`Animal ${dbAnimal.animalId}`)
			const weight =
				dbHealthRecords.length > 0 && dbHealthRecords[0]!.weight! > 0
					? dbHealthRecords[0]!.weight
					: dbAnimal.weight
			dbAnimal.healthRecords = dbHealthRecords
			setAnimal({ ...dbAnimal, weight: weight! })
		} catch (_error) {
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

	// biome-ignore lint: UseEffect is only called by farm and params.animalUuid
	useEffect(() => {
		setHeaderTitle('Animal')
		setActiveTab('healthRecords')
		getInitialData()
	}, [params.animalUuid, farm])

	return (
		<div className="flex flex-col gap-4 lg:gap-10 p-4 w-full h-full overflow-auto">
			<div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
				<div className="flex flex-col gap-4 w-full">
					<div className="flex flex-row justify-center items-center gap-4 w-full">
						<span className="text-md font-bold text-xl">{t('animalId')}</span>
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
					</div>
					<div className="grid grid-cols-2 gap-2 w-full justify-center items-center">
						<div className="flex flex-col gap-2 w-full">
							<DetailItem label={t('animalId')} value={animal.animalId} />
							<DetailItem label={t('species')} value={animal.species.name} />
							<DetailItem label={t('breed')} value={animal.breed.name} />
							{animal.birthDate && (
								<DetailItem
									label={t('birthDate')}
									value={dayjs(animal.birthDate).format('DD/MM/YYYY')}
								/>
							)}
							{animal.deathDate && (
								<DetailItem
									label={t('deathDate')}
									value={dayjs(animal.deathDate).format('DD/MM/YYYY')}
								/>
							)}
						</div>
						<div className="flex flex-col gap-2 w-full">
							<DetailItem
								label={t('gender')}
								value={
									<>
										{t(`genderList.${animal.gender.toLowerCase()}`)}
										<GenderIcon gender={animal.gender} />
									</>
								}
							/>
							<DetailItem label={t('color')} value={animal.color} />
							<DetailItem
								label={t('weight')}
								value={
									<>
										{animal.weight} {farm?.weightUnit}
									</>
								}
							/>
							{animal.purchaseDate && (
								<DetailItem
									label={t('purchaseDate')}
									value={dayjs(animal.purchaseDate).format('DD/MM/YYYY')}
								/>
							)}
							{animal.soldDate && (
								<DetailItem
									label={t('soldDate')}
									value={dayjs(animal.soldDate).format('DD/MM/YYYY')}
								/>
							)}
						</div>
						{animal.origin && (
							<div className="col-span-2 w-full">
								<DetailItem label={t('origin')} value={animal.origin} />
							</div>
						)}
					</div>
				</div>
				<div className="flex justify-center items-center w-full">
					<img
						className="w-full h-full sm:w-75 sm:h-75 rounded-3xl object-cover"
						src={animal.picture || '/assets/default-imgs/cow.svg'}
						alt={animal.species.name}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-center items-center">
				<div role="tablist" className="tabs tabs-box flex flex-col md:flex-row w-auto">
					{[
						{ key: 'healthRecords', label: t('healthRecords'), onClick: getHealthRecords },
						{
							key: 'productionRecords',
							label: t('productionRecords'),
							onClick: getProductionRecords,
						},
						{ key: 'relatedAnimals', label: t('relatedAnimals'), onClick: getRelatedAnimals },
					].map((tab) => (
						<button
							key={tab.key}
							type="button"
							role="tab"
							className={`tab ${activeTab === tab.key && 'tab-active'} flex items-center justify-center gap-2`}
							onClick={tab.onClick}
						>
							<i className={buttonIcon(tab.key)} />
							<span>{tab.label}</span>
						</button>
					))}
				</div>
				{activeTab === 'healthRecords' && (
					<HealthRecordsTable
						haveUser={!!user}
						farm={farm}
						healthRecords={animal?.healthRecords || []}
						employees={employees}
						removeHealthRecord={handleRemoveHealthRecord}
					/>
				)}
				{activeTab === 'productionRecords' && (
					<ProductionRecordsTable
						productionRecords={animal?.productionRecords || []}
						haveUser={!!user}
						farm={farm}
						removeProductionRecord={handleRemoveProductionRecord}
					/>
				)}
				{activeTab === 'relatedAnimals' && (
					<>
						<RelatedAnimalsTable
							title={t('parentsTitle')}
							animals={animal?.relatedAnimals?.parents || []}
							haveUser={!!user}
							type="parent"
							removeRelation={handleRemoveRelation}
						/>
						<RelatedAnimalsTable
							title={t('childrenTitle')}
							animals={animal?.relatedAnimals?.children || []}
							haveUser={!!user}
							type="child"
							removeRelation={handleRemoveRelation}
						/>
					</>
				)}
			</div>
		</div>
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
	origin: '',
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

export default Animal
