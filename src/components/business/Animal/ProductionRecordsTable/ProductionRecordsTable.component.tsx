import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { ProductionRecordsService } from '@/services/productionRecords'
import { useAppStore } from '@/store/useAppStore'

import type { ProductionRecordsTableProps } from './ProductionRecordsTable.types'

import * as S from './ProductionRecordsTable.styles'

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
		<S.TableContainer>
			<S.CenterTitle>
				<S.Label>{t('title')}</S.Label>
				{haveUser && (
					<ActionButton
						title="Add Production Record"
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddHealthRecord}
					/>
				)}
			</S.CenterTitle>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>{t('date')}</Table.HeadCell>
						<Table.HeadCell>{t('quantity')}</Table.HeadCell>
						<Table.HeadCell>{t('notes')}</Table.HeadCell>
						{haveUser && <Table.HeadCell>{t('actions')}</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{productionRecords.map((productionRecord) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell>{dayjs(productionRecord.date).format('MM/DD/YYYY')}</Table.Cell>
							<Table.Cell>
								{productionRecord.quantity}
								{farm!.liquidUnit}
							</Table.Cell>
							<Table.Cell>{productionRecord.notes}</Table.Cell>
							{haveUser && (
								<Table.Cell>
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
								</Table.Cell>
							)}
						</Table.Row>
					))}
					{productionRecords.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={haveUser ? 12 : 11}>{t('noProductionRecords')}</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
