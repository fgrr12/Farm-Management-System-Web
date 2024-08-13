import { AppRoutes } from '@/config/constants/routes'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { ProductionRecordsService } from '@/services/productionRecords'
import { useFarmStore } from '@/store/useFarmStore'

import type { ProductionRecordsTableProps } from './ProductionRecordsTable.types'

import * as S from './ProductionRecordsTable.styles'

export const ProductionRecordsTable: FC<ProductionRecordsTableProps> = ({
	productionRecords,
	user,
	removeProductionRecord,
}) => {
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()

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
		await ProductionRecordsService.updateProductionRecordsStatus(uuid, false)
		removeProductionRecord(uuid)
	}
	return (
		<S.TableContainer>
			<S.CenterTitle>
				<S.Label>Production Records</S.Label>
				{user && (
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
						<Table.HeadCell>Date</Table.HeadCell>
						<Table.HeadCell>Quantity</Table.HeadCell>
						<Table.HeadCell>Notes</Table.HeadCell>
						{user && <Table.HeadCell>Actions</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{productionRecords.map((productionRecord) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell data-title="Date">
								{dayjs(productionRecord.date).format('MM/DD/YYYY')}
							</Table.Cell>
							<Table.Cell data-title="Quantity">
								{productionRecord.quantity}
								{farm!.liquidUnit}
							</Table.Cell>
							<Table.Cell data-title="Notes">{productionRecord.notes}</Table.Cell>
							{user && (
								<Table.Cell data-title="Actions">
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
							<Table.Cell colSpan={user ? 12 : 11}>No production records found</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
