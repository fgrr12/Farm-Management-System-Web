import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'
import { EmployeesService } from '@/services/employees'
import { FarmsService } from '@/services/farms'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import { RelatedAnimalsService } from '@/services/relatedAnimals'

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const DetailItem = memo(({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
		<dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
		<dd className="text-lg font-semibold text-gray-900 flex items-center gap-2">{value}</dd>
	</div>
))

const GenderIcon = memo(({ gender }: { gender: string }) =>
	gender.toLowerCase() === 'male' ? (
		<i className="i-tdesign-gender-male bg-blue-500! w-8! h-8!" />
	) : (
		<i className="i-tdesign-gender-female bg-pink-500! w-8! h-8!" />
	)
)

const Animal = () => {
	const { user } = useUserStore()
	const { farm, species, breeds, setFarm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animal'])

	const { defaultModalData, setModalData } = useAppStore()
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()
	const [animal, setAnimal] = useState(ANIMAL_INITIAL_STATE)
	const [employees, setEmployees] = useState<User[]>([])
	const [activeTab, setActiveTab] = useState<
		'healthRecords' | 'productionRecords' | 'relatedAnimals'
	>('healthRecords')

	const { specie, breed } = useMemo(() => {
		return {
			specie: species.find((sp) => sp.uuid === animal.speciesUuid),
			breed: breeds.find((br) => br.uuid === animal.breedUuid),
		}
	}, [breeds, animal.breedUuid, animal.speciesUuid, species])

	const handleEditAnimal = useCallback(() => {
		navigate(AppRoutes.EDIT_ANIMAL.replace(':animalUuid', animal.uuid))
	}, [navigate, animal.uuid])

	const handleRemoveAnimal = useCallback(async () => {
		setModalData({
			open: true,
			title: t('modal.removeAnimal.title'),
			message: t('modal.removeAnimal.message'),
			onAccept: async () => {
				await withLoadingAndError(async () => {
					await AnimalsService.deleteAnimal(animal.uuid, false)
					setModalData(defaultModalData)
					showToast(t('toast.deleted'), 'success')
					navigate(AppRoutes.ANIMALS)
				}, t('toast.deleteError'))
			},
			onCancel: () => {
				setModalData(defaultModalData)
				showToast(t('toast.notDeleted'), 'info')
			},
		})
	}, [animal.uuid, t, setModalData, defaultModalData, withLoadingAndError, showToast, navigate])

	const handleRemoveRelation = useCallback(
		(uuid: string) => {
			const updateParents = animal.relatedAnimals!.parents.filter(
				(related) => related.uuid !== uuid
			)
			const updateChildren = animal.relatedAnimals!.children.filter(
				(related) => related.uuid !== uuid
			)
			setAnimal((prev) => ({
				...prev,
				relatedAnimals: { parents: updateParents, children: updateChildren },
			}))
		},
		[animal.relatedAnimals]
	)

	const handleRemoveHealthRecord = useCallback(
		(uuid: string) => {
			const updateHealthRecords = animal.healthRecords!.filter((record) => record.uuid !== uuid)
			setAnimal((prev) => ({ ...prev, healthRecords: updateHealthRecords }))
		},
		[animal.healthRecords]
	)

	const handleRemoveProductionRecord = useCallback(
		(uuid: string) => {
			const updateProductionRecords = animal.productionRecords!.filter(
				(record) => record.uuid !== uuid
			)
			setAnimal((prev) => ({ ...prev, productionRecords: updateProductionRecords }))
		},
		[animal.productionRecords]
	)

	const getHealthRecords = useCallback(async () => {
		if (activeTab === 'healthRecords') return
		setActiveTab('healthRecords')
		const dbHealthRecords = await HealthRecordsService.getHealthRecords(animal.uuid)
		if (dbHealthRecords[0]?.weight! > 0) {
			animal.weight = dbHealthRecords[0]?.weight ?? animal.weight
		}
		setAnimal((prev) => ({ ...prev, healthRecords: dbHealthRecords, weight: animal.weight }))
	}, [activeTab, animal])

	const getProductionRecords = useCallback(async () => {
		if (activeTab === 'productionRecords') return
		setActiveTab('productionRecords')
		const dbProductionRecords = await ProductionRecordsService.getProductionRecords(animal.uuid)
		setAnimal((prev) => ({ ...prev, productionRecords: dbProductionRecords }))
	}, [activeTab, animal.uuid])

	const getRelatedAnimals = useCallback(async () => {
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
	}, [activeTab, animal.uuid])

	const getInitialData = useCallback(async () => {
		await withLoadingAndError(async () => {
			const animalId = params.animalUuid as string

			const dbAnimal = await AnimalsService.getAnimal(animalId!)
			const dbHealthRecords = await HealthRecordsService.getHealthRecords(animalId!)

			if (!farm) {
				const farmData = await FarmsService.getFarm(dbAnimal!.farmUuid)
				setFarm(farmData)
			}

			if (user && farm) {
				setEmployees(await EmployeesService.getEmployees(farm.uuid))
			}

			setPageTitle(`Animal ${dbAnimal.animalId}`)
			const weight =
				dbHealthRecords.length > 0 && dbHealthRecords[0]!.weight! > 0
					? dbHealthRecords[0]!.weight
					: dbAnimal.weight
			dbAnimal.healthRecords = dbHealthRecords
			setAnimal({ ...dbAnimal, weight: weight! })

			return dbAnimal
		}, t('toast.errorGettingAnimal'))
	}, [params.animalUuid, farm, user, setFarm, setPageTitle, withLoadingAndError, t])

	// biome-ignore lint: UseEffect is only called by farm and params.animalUuid
	useEffect(() => {
		setPageTitle('Animal')
		setActiveTab('healthRecords')
		getInitialData()
	}, [params.animalUuid, farm, getInitialData, setPageTitle])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Hero Section */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
									<i className="i-material-symbols-pets text-white w-6 h-6" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-white">{animal.animalId}</h1>
									<p className="text-blue-100">
										{specie?.name} • {breed?.name}
									</p>
								</div>
							</div>
							{user && (
								<div className="flex gap-2">
									<ActionButton
										icon="i-material-symbols-edit-square-outline"
										title={t('addHealthRecord')}
										onClick={handleEditAnimal}
									/>
									<ActionButton
										icon="i-material-symbols-delete-outline"
										title={t('addProductionRecord')}
										onClick={handleRemoveAnimal}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Animal Image */}
							<div className="lg:col-span-1">
								<div className="relative">
									<img
										className="w-full h-80 object-cover rounded-xl shadow-lg"
										src={animal.picture || '/assets/default-imgs/cow.svg'}
										alt={specie?.name || 'default'}
									/>
									<div className="absolute top-4 right-4">
										<div
											className={`px-3 py-1 rounded-full text-sm font-medium ${
												animal.gender.toLowerCase() === 'male'
													? 'bg-blue-100 text-blue-800'
													: 'bg-pink-100 text-pink-800'
											}`}
										>
											<div className="flex items-center gap-2">
												<GenderIcon gender={animal.gender} />
												{t(`genderList.${animal.gender.toLowerCase()}`)}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Animal Details */}
							<div className="lg:col-span-2">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Basic Info */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
											{t('basicInfo')}
										</h3>
										<DetailItem label={t('animalId')} value={animal.animalId} />
										<DetailItem label={t('species')} value={specie?.name} />
										<DetailItem label={t('breed')} value={breed?.name} />
										{animal.color && <DetailItem label={t('color')} value={animal.color} />}
										<DetailItem
											label={t('weight')}
											value={`${animal.weight} ${farm?.weightUnit}`}
										/>
									</div>

									{/* Dates & Status */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
											{t('datesAndStatus')}
										</h3>
										{animal.birthDate && (
											<DetailItem
												label={t('birthDate')}
												value={dayjs(animal.birthDate).format('DD/MM/YYYY')}
											/>
										)}
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
										{animal.deathDate && (
											<DetailItem
												label={t('deathDate')}
												value={dayjs(animal.deathDate).format('DD/MM/YYYY')}
											/>
										)}
										{animal.origin && <DetailItem label={t('origin')} value={animal.origin} />}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Tabs Section */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Tab Navigation */}
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6" aria-label="Tabs">
							{[
								{
									key: 'healthRecords',
									label: t('healthRecords'),
									onClick: getHealthRecords,
									icon: 'i-material-symbols-light-health-metrics-rounded',
									color: 'emerald',
								},
								{
									key: 'productionRecords',
									label: t('productionRecords'),
									onClick: getProductionRecords,
									icon: 'i-icon-park-outline-milk',
									color: 'blue',
								},
								{
									key: 'relatedAnimals',
									label: t('relatedAnimals'),
									onClick: getRelatedAnimals,
									icon: 'i-tabler-circles-relation',
									color: 'yellow',
								},
							].map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={tab.onClick}
									className={`
										group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
										${
											activeTab === tab.key
												? `border-${tab.color}-500 text-${tab.color}-600`
												: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
										}
									`}
								>
									<i
										className={`${tab.icon} w-7! h-7! mr-2 ${
											activeTab === tab.key
												? `bg-${tab.color}-500!`
												: 'text-gray-400 group-hover:text-gray-500'
										}`}
									/>
									{tab.label}
								</button>
							))}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === 'healthRecords' && (
							<div className="space-y-6">
								<HealthRecordsTable
									haveUser={!!user}
									farm={farm}
									healthRecords={animal?.healthRecords || []}
									employees={employees}
									removeHealthRecord={handleRemoveHealthRecord}
								/>
							</div>
						)}
						{activeTab === 'productionRecords' && (
							<div className="space-y-6">
								<ProductionRecordsTable
									productionRecords={animal?.productionRecords || []}
									haveUser={!!user}
									farm={farm}
									removeProductionRecord={handleRemoveProductionRecord}
								/>
							</div>
						)}
						{activeTab === 'relatedAnimals' && (
							<div className="space-y-8">
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
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

const ANIMAL_INITIAL_STATE: Animal = {
	uuid: '',
	speciesUuid: '',
	breedUuid: '',
	farmUuid: '',
	animalId: '0',
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	status: true,
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

export default memo(Animal)
