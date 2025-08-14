import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { FarmsService } from '@/services/farms'

import { CreateFarmModal } from '../CreateFarmModal'

export const FarmSelector = memo(() => {
	const { t } = useTranslation(['common'])
	const { user } = useUserStore()
	const { farm, setFarm } = useFarmStore()
	const [availableFarms, setAvailableFarms] = useState<Farm[]>([])
	const [loading, setLoading] = useState(false)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	const loadFarms = useCallback(async () => {
		setLoading(true)
		try {
			const farms = await FarmsService.getAllFarms()
			setAvailableFarms(farms)

			if (!farm && farms.length > 0) {
				setFarm(farms[0])
			}
		} catch (error) {
			console.error('Error loading farms:', error)
		} finally {
			setLoading(false)
		}
	}, [farm, setFarm])

	const handleFarmChange = useCallback(
		async (selectedFarm: Farm) => {
			if (user?.role === 'admin') {
				await useFarmStore.getState().loadFarmData(selectedFarm.uuid, user!.role)
			}
		},
		[user]
	)

	const handleCreateFarm = useCallback(() => {
		setIsCreateModalOpen(true)
	}, [])

	const handleCloseCreateModal = useCallback(() => {
		setIsCreateModalOpen(false)
	}, [])

	const handleFarmCreated = useCallback(
		(newFarm: Farm) => {
			setAvailableFarms((prev) => [...prev, newFarm])
			setFarm(newFarm)
		},
		[setFarm]
	)

	useEffect(() => {
		loadFarms()
	}, [loadFarms])

	if (user?.role !== 'admin') return null

	return (
		<div className="mt-6 space-y-2">
			<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
				{t('admin.farmSelector')}
			</div>

			{loading ? (
				<div className="px-4 py-3 text-center">
					<div className="loading loading-spinner loading-sm" />
					<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
						{t('admin.loadingFarms')}
					</span>
				</div>
			) : (
				<div className="dropdown dropdown-top dropdown-end w-full">
					<button
						type="button"
						tabIndex={0}
						className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
								<i className="i-material-symbols-agriculture w-5! h-5! bg-blue-600! dark:bg-blue-400!" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="font-medium text-gray-900 dark:text-gray-100 truncate">
									{farm?.name || t('admin.selectFarm')}
								</div>
								{farm && (
									<div className="text-xs text-gray-500 dark:text-gray-400 truncate">
										{farm.address || t('admin.noLocation')}
									</div>
								)}
							</div>
						</div>
						<i className="i-material-symbols-expand-more w-5! h-5! bg-gray-400! dark:bg-gray-500! transition-transform duration-200" />
					</button>

					<ul className="dropdown-content menu bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-[10] mb-2 w-full max-w-xs p-2 max-h-64 overflow-y-auto">
						{availableFarms.length > 0 ? (
							<>
								<li className="menu-title text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
									<span>{t('admin.availableFarms')}</span>
								</li>
								{availableFarms.map((farmOption) => (
									<li key={farmOption.uuid}>
										<button
											type="button"
											onClick={() => handleFarmChange(farmOption)}
											className={`flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
												farm?.uuid === farmOption.uuid
													? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
													: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
											}`}
										>
											<i className="i-material-symbols-agriculture w-4! h-4! bg-green-600! dark:bg-green-400!" />
											<div className="min-w-0 flex-1 text-left">
												<div className="font-medium truncate">{farmOption.name}</div>
												{farmOption.address && (
													<div className="text-xs opacity-60 truncate">{farmOption.address}</div>
												)}
											</div>
											{farm?.uuid === farmOption.uuid && (
												<i className="i-material-symbols-check w-4! h-4! bg-blue-600! dark:bg-blue-400!" />
											)}
										</button>
									</li>
								))}
								<div className="divider my-1" />
								<li>
									<button
										type="button"
										onClick={handleCreateFarm}
										className="flex items-center gap-3 px-3 py-2 min-h-[44px] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-green-700 dark:text-green-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
									>
										<i className="i-material-symbols-add w-4! h-4! bg-green-600! dark:bg-green-400!" />
										<span className="font-medium">{t('admin.createNewFarm')}</span>
									</button>
								</li>
							</>
						) : (
							<>
								<li>
									<div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
										<i className="i-material-symbols-info w-5! h-5! bg-gray-400! mb-2" />
										<div className="text-sm">{t('admin.noFarmsAvailable')}</div>
									</div>
								</li>
								<div className="divider my-1" />
								<li>
									<button
										type="button"
										onClick={handleCreateFarm}
										className="flex items-center gap-3 px-3 py-2 min-h-[44px] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-green-700 dark:text-green-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
									>
										<i className="i-material-symbols-add w-4! h-4! bg-green-600! dark:bg-green-400!" />
										<span className="font-medium">{t('admin.createNewFarm')}</span>
									</button>
								</li>
							</>
						)}
					</ul>
				</div>
			)}

			{farm && (
				<div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-admin-panel-settings w-4! h-4! bg-blue-600! dark:bg-blue-400!" />
						<span className="text-xs font-medium text-blue-700 dark:text-blue-300">
							{t('admin.adminMode')}
						</span>
					</div>
				</div>
			)}

			<CreateFarmModal
				isOpen={isCreateModalOpen}
				onClose={handleCloseCreateModal}
				onFarmCreated={handleFarmCreated}
			/>
		</div>
	)
})

FarmSelector.displayName = 'FarmSelector'
