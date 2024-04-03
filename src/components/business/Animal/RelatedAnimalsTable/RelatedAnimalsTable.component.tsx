import { AppRoutes } from '@/config/constants/routes'
import { useLocation, useNavigate } from 'react-router-dom'

// Components
import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

// Types
import type { RelatedAnimalsTableProps } from './RelatedAnimalsTable.types'

// Styles
import * as S from './RelatedAnimalsTable.styles'

export const RelatedAnimalsTable: FC<RelatedAnimalsTableProps> = ({ title, animals, user }) => {
	const location = useLocation()
	const navigate = useNavigate()

	const handleAddRelatedAnimals = () => {
		const animalUuid = location.pathname.split('/').pop()
		const path = AppRoutes.ADD_RELATED_ANIMALS.replace(':animalUuid', animalUuid || '')
		navigate(path)
	}
	return (
		<S.TableContainer>
			<S.CenterTitle>
				<S.Label>{title}</S.Label>
				{user && (
					<ActionButton
						title={title.startsWith('Parents') ? 'Add Parent' : 'Add Child'}
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddRelatedAnimals}
					/>
				)}
			</S.CenterTitle>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>Animal ID</Table.HeadCell>
						<Table.HeadCell>Breed</Table.HeadCell>
						<Table.HeadCell>Relation</Table.HeadCell>
						{user && <Table.HeadCell>Actions</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{animals?.map((animal) => (
						<Table.Row key={crypto.randomUUID()}>
							<Table.Cell data-title="Animal ID">{animal.animalId}</Table.Cell>
							<Table.Cell data-title="Breed">{animal.breed}</Table.Cell>
							<Table.Cell data-title="Relation">{animal.relation}</Table.Cell>
							{user && (
								<Table.Cell data-title="Actions">
									<ActionButton title="View" icon="i-material-symbols-visibility-outline" />
									<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
									<ActionButton title="Delete" icon="i-material-symbols-delete-outline" />
								</Table.Cell>
							)}
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
