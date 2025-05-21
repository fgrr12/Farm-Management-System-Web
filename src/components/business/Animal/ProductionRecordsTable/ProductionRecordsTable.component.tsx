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
	const { defaultModalData, setModalData, setLoading } = useAppStore()
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
				setLoading(true)
				await ProductionRecordsService.updateProductionRecordsStatus(uuid, false)
				removeProductionRecord(uuid)
				setModalData(defaultModalData)
				setLoading(false)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}
	return (
		<div className="w-full xl:w-auto">
			<div className="flex justify-center items-center">
				<div className="font-bold">{t('title')}</div>
				{haveUser && (
					<ActionButton
						title="Add Production Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</div>
			<div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
				<table className="table table-zebra">
					<thead>
						<tr>
							<th>{t('date')}</th>
							<th>{t('quantity')}</th>
							<th>{t('notes')}</th>
							{haveUser && <th>{t('actions')}</th>}
						</tr>
					</thead>
					<tbody>
						{productionRecords.map((productionRecord) => (
							<tr key={self.crypto.randomUUID()}>
								<td>{dayjs(productionRecord.date).format('DD/MM/YYYY')}</td>
								<td>
									{productionRecord.quantity}
									{farm!.liquidUnit}
								</td>
								<td>{productionRecord.notes}</td>
								{haveUser && (
									<td>
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
									</td>
								)}
							</tr>
						))}
						{productionRecords.length === 0 && (
							<tr>
								<td className="text-center font-bold" colSpan={haveUser ? 12 : 11}>
									{t('noProductionRecords')}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
