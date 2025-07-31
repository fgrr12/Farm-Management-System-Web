import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'

import { ProductionRecordsService } from '@/services/productionRecords'

import { ActionButton } from '@/components/ui/ActionButton'

import type { ProductionRecordsTableProps } from './ProductionRecordsTable.types'

export const ProductionRecordsTable: FC<ProductionRecordsTableProps> = ({
	productionRecords,
	haveUser,
	farm,
	removeProductionRecord,
}) => {
	const { defaultModalData, setModalData, setLoading, setToastData } = useAppStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalProductionRecords'])

	const handleAddHealthRecord = () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.ADD_PRODUCTION_RECORD.replace(':animalUuid', animalUuid)
		navigate(path)
	}

	const handleEditHealthRecord = (uuid: string) => () => {
		const animalUuid = params.animalUuid as string
		const path = AppRoutes.EDIT_PRODUCTION_RECORD.replace(':animalUuid', animalUuid).replace(
			':productionRecordUuid',
			uuid
		)
		navigate(path)
	}

	const handleDeleteHealthRecord = (uuid: string) => async () => {
		setModalData({
			open: true,
			title: t('modal.deleteProductionRecord.title'),
			message: t('modal.deleteProductionRecord.message'),
			onAccept: async () => {
				try {
					setLoading(true)
					await ProductionRecordsService.updateProductionRecordsStatus(uuid, false)
					removeProductionRecord(uuid)
					setModalData(defaultModalData)
					setLoading(false)
					setToastData({
						message: t('toast.deleted'),
						type: 'success',
					})
				} catch (_error) {
					setToastData({
						message: t('toast.deleteError'),
						type: 'error',
					})
				}
			},
			onCancel: () => {
				setModalData(defaultModalData)
				setToastData({
					message: t('toast.notDeleted'),
					type: 'info',
				})
			},
		})
	}
	return (
		<div className="w-full">
			{/* Header with Title and Add Button */}
			<div className="flex items-center justify-between gap-4 mb-6">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
				{haveUser && (
					<ActionButton
						title="Add Production Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</div>

			{/* Modern Table Design */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
						aria-label="Production records"
					>
						<thead className="bg-gray-50 dark:bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('date')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('quantity')}
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
									{t('notes')}
								</th>
								{haveUser && (
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										{t('actions')}
									</th>
								)}
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{productionRecords.map((productionRecord, index) => (
								<tr
									key={productionRecord.uuid}
									className={
										index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
									}
								>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">
										{dayjs(productionRecord.date).format('DD/MM/YYYY')}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
										<div className="flex items-center gap-1">
											<span className="font-semibold">{productionRecord.quantity}</span>
											<span className="text-gray-500 dark:text-gray-400">{farm!.liquidUnit}</span>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
										<div className="max-w-xs truncate" title={productionRecord.notes}>
											{productionRecord.notes}
										</div>
									</td>
									{haveUser && (
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<ActionButton
													title="Edit"
													icon="i-material-symbols-edit-square-outline"
													onClick={handleEditHealthRecord(productionRecord.uuid)}
												/>
												<ActionButton
													title="Delete"
													icon="i-material-symbols-delete-outline"
													onClick={handleDeleteHealthRecord(productionRecord.uuid)}
												/>
											</div>
										</td>
									)}
								</tr>
							))}
							{productionRecords.length === 0 && (
								<tr>
									<td
										className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
										colSpan={haveUser ? 4 : 3}
									>
										<div className="flex flex-col items-center gap-2">
											<i className="i-material-symbols-production-quantity-limits w-12 h-12 text-gray-300 dark:text-gray-600" />
											<span className="font-medium">{t('noProductionRecords')}</span>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
