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

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const DetailItem = memo(({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
		<dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{label}</dt>
		<dd className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center gap-2 break-words">
			{value}
		</dd>
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
					await AnimalsService.updateAnimalStatus(animal.uuid, user!.uuid)
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
	}, [
		animal.uuid,
		user,
		t,
		setModalData,
		defaultModalData,
		withLoadingAndError,
		showToast,
		navigate,
	])

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
	}, [activeTab])

	const getProductionRecords = useCallback(async () => {
		if (activeTab === 'productionRecords') return
		setActiveTab('productionRecords')
	}, [activeTab])

	const getRelatedAnimals = useCallback(async () => {
		if (activeTab === 'relatedAnimals') return
		setActiveTab('relatedAnimals')
	}, [activeTab])

	const getInitialData = useCallback(async () => {
		await withLoadingAndError(async () => {
			const animalUuid = params.animalUuid as string

			const dbAnimal = await AnimalsService.loadAnimalWithDetails(animalUuid!)

			if (!farm) {
				const farmData = await FarmsService.getFarm(dbAnimal.farmUuid)
				setFarm(farmData)
			}

			if (user && farm) {
				setEmployees(await EmployeesService.getEmployees(farm.uuid))
			}

			setPageTitle(`Animal ${dbAnimal.animalId}`)

			// Calculate weight from health records or use animal weight
			const weight =
				dbAnimal.healthRecords &&
				dbAnimal.healthRecords.length > 0 &&
				dbAnimal.healthRecords[0]!.weight! > 0
					? dbAnimal.healthRecords[0]!.weight
					: dbAnimal.weight

			setAnimal({ ...dbAnimal, weight: weight! })

			return dbAnimal
		}, t('toast.errorGettingAnimal'))
	}, [params.animalUuid, farm, user, setFarm, setPageTitle, withLoadingAndError, t])

	// biome-ignore lint: UseEffect is only called by farm and params.animalUuid
	useEffect(() => {
		setPageTitle('Animal')
		getInitialData()
	}, [params.animalUuid, farm, getInitialData, setPageTitle])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				{/* Hero Section */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-pets bg-white! w-6! h-6! sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0">
									<h1 className="text-xl sm:text-2xl font-bold text-white truncate">
										{animal.animalId}
									</h1>
									<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base truncate">
										{specie?.name} • {breed?.name}
									</p>
								</div>
							</div>
							{user && (
								<div className="flex gap-2 flex-shrink-0">
									<ActionButton
										icon="i-material-symbols-edit-square-outline"
										title="Edit Animal"
										onClick={handleEditAnimal}
									/>
									<ActionButton
										icon="i-material-symbols-delete-outline"
										title="Delete Animal"
										onClick={handleRemoveAnimal}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="p-4 sm:p-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
							{/* Animal Image */}
							<div className="lg:col-span-1">
								<div className="relative">
									<img
										className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
										src={animal.picture || '/assets/default-imgs/cow.svg'}
										alt={specie?.name || 'default'}
									/>
									<div className="absolute top-3 right-3 sm:top-4 sm:right-4">
										<div
											className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
												animal.gender.toLowerCase() === 'male'
													? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:border dark:border-blue-700'
													: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 dark:border dark:border-pink-700'
											}`}
										>
											<div className="flex items-center gap-1 sm:gap-2">
												<GenderIcon gender={animal.gender} />
												<span className="hidden sm:inline">
													{t(`genderList.${animal.gender.toLowerCase()}`)}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Animal Details */}
							<div className="lg:col-span-2">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
									{/* Basic Info */}
									<div className="space-y-3 sm:space-y-4">
										<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
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
									<div className="space-y-3 sm:space-y-4">
										<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
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
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
					{/* Tab Navigation */}
					<div className="border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
						<nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
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
								group inline-flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap
								${
									activeTab === tab.key
										? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
										: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
								}
							`}
								>
									<i
										className={`${tab.icon} w-5! h-5! sm:w-7! sm:h-7! mr-1 sm:mr-2 ${
											activeTab === tab.key
												? `bg-${tab.color}-500! dark:bg-${tab.color}-400!`
												: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
										}`}
									/>
									<span className="hidden sm:inline">{tab.label}</span>
									<span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
								</button>
							))}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-4 sm:p-6">
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
	healthStatus: 'unknown',
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
