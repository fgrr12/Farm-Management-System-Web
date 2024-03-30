import firestoreHandler from '@/config/persistence/firestoreHandler'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Components
import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

// Types
import type { AnimalInformation } from './Animal.types'

// Styles
import * as S from './Animal.styles'

export const Animal: FC = () => {
	const location = useLocation()
	const { pathname } = location
	const [animal, setAnimal] = useState<AnimalInformation>(ANIMAL_INITIAL_STATE)
	const [user, setUser] = useState<boolean>(false) // useState<UserInformation>(USER_INITIAL_STATE)

	const getAnimal = async () => {
		// const parents = animalMock.relatedAnimals.parents?.map((parent) => ({
		// 	animalId: parent.animalId,
		// 	breed: parent.breed,
		// 	relation: parent.relation,
		// }))
		// const children = animalMock.relatedAnimals.children?.map((child) => ({
		// 	animalId: child.animalId,
		// 	breed: child.breed,
		// 	relation: child.relation,
		// }))
		// const healthRecords = animalMock.healthRecords?.map((healthRecord) => ({
		// 	reason: healthRecord.reason,
		// 	notes: healthRecord.notes,
		// 	type: healthRecord.type,
		// 	reviewedBy: healthRecord.reviewedBy,
		// 	date: dayjs(healthRecord.date).format('MM/DD/YYYY'),
		// 	weight: healthRecord.weight,
		// 	temperature: healthRecord.temperature,
		// 	medication: healthRecord.medication,
		// 	dosage: healthRecord.dosage,
		// 	frequency: healthRecord.frequency,
		// 	duration: healthRecord.duration,
		// }))

		// await firestoreHandler.setDocument('animals', crypto.randomUUID(), {
		// 	animalId: animalMock.animalId,
		// 	species: animalMock.species,
		// 	breed: animalMock.breed,
		// 	gender: animal.gender,
		// 	color: animalMock.color,
		// 	weight: animalMock.weight,
		// 	picture: animalMock.picture,
		// 	relatedAnimals: {
		// 		parents: parents,
		// 		children: children,
		// 	},
		// 	healthRecords: healthRecords,
		// 	birthDate: dayjs(animalMock.birthDate).format('MM/DD/YYYY'),
		// 	purchaseDate: dayjs(animalMock.purchaseDate).format('MM/DD/YYYY'),
		// })

		const animalId = pathname.split('/').pop()
		const dbData = (await firestoreHandler.getDocument('animals', animalId!)) as AnimalInformation

		setAnimal(dbData)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimal()
	}, [])

	return (
		<S.Container>
			<S.AnimalContainer>
				<S.InfoContainer>
					<S.CenterTitle>
						<S.Label>Animal ID</S.Label>
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit-square-outline"
							disabled={!user}
						/>
						<ActionButton
							title="Delete"
							icon="i-material-symbols-delete-outline"
							disabled={!user}
						/>
					</S.CenterTitle>
					<S.AnimalInfo>
						<div>
							<S.Label>ID</S.Label>
							<S.Value>{animal.animalId}</S.Value>
						</div>
						<div>
							<S.Label>Species</S.Label>
							<S.Value>{animal.species}</S.Value>
						</div>
						<div>
							<S.Label>Breed</S.Label>
							<S.Value>{animal.breed}</S.Value>
						</div>
						<div>
							<S.Label>Gender</S.Label>
							<S.Value>{animal.gender}</S.Value>
						</div>
						<div>
							<S.Label>Color</S.Label>
							<S.Value>{animal.color}</S.Value>
						</div>
						<div>
							<S.Label>Weight</S.Label>
							<S.Value>{animal.weight}</S.Value>
						</div>
						<div>
							<S.Label>Birth Date</S.Label>
							<S.Value>{dayjs(animal.birthDate).format('MM/DD/YYYY')}</S.Value>
						</div>
						<div>
							<S.Label>Purchase Date</S.Label>
							<S.Value>{dayjs(animal.purchaseDate).format('MM/DD/YYYY')}</S.Value>
						</div>
						{animal.soldDate && (
							<div>
								<S.Label>Purchase Date</S.Label>
								<S.Value>{dayjs(animal.soldDate).format('MM/DD/YYYY')}</S.Value>
							</div>
						)}
						{animal.deathDate && (
							<div>
								<S.Label>Death Date</S.Label>
								<S.Value>{dayjs(animal.deathDate).format('MM/DD/YYYY')}</S.Value>
							</div>
						)}
					</S.AnimalInfo>
				</S.InfoContainer>

				<S.ImageContainer>
					<S.Image src={animal.picture} alt={animal.species} />
				</S.ImageContainer>
			</S.AnimalContainer>

			<S.TableContainer>
				<S.CenterTitle>
					<S.Label>Health Records</S.Label>
					<ActionButton
						title="Add Health Record"
						icon="i-material-symbols-add-circle-outline"
						disabled={!user}
					/>
				</S.CenterTitle>
				<Table>
					<Table.Head>
						<Table.Row>
							<Table.HeadCell>Reason</Table.HeadCell>
							<Table.HeadCell>Notes</Table.HeadCell>
							<Table.HeadCell>Type</Table.HeadCell>
							<Table.HeadCell>Reviewed By</Table.HeadCell>
							<Table.HeadCell>Date</Table.HeadCell>
							<Table.HeadCell>Weight</Table.HeadCell>
							<Table.HeadCell>Temperature</Table.HeadCell>
							<Table.HeadCell>Medication</Table.HeadCell>
							<Table.HeadCell>Dosage</Table.HeadCell>
							<Table.HeadCell>Frequency</Table.HeadCell>
							<Table.HeadCell>Duration</Table.HeadCell>
							<Table.HeadCell>Actions</Table.HeadCell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{animal.healthRecords?.map((healthRecord) => (
							<Table.Row key={crypto.randomUUID()}>
								<Table.Cell>{healthRecord.reason}</Table.Cell>
								<Table.Cell>{healthRecord.notes}</Table.Cell>
								<Table.Cell>{healthRecord.type}</Table.Cell>
								<Table.Cell>{healthRecord.reviewedBy}</Table.Cell>
								<Table.Cell>{dayjs(healthRecord.date).format('MM/DD/YYYY')}</Table.Cell>
								<Table.Cell>{healthRecord.weight}</Table.Cell>
								<Table.Cell>{healthRecord.temperature}</Table.Cell>
								<Table.Cell>{healthRecord.medication}</Table.Cell>
								<Table.Cell>{healthRecord.dosage}</Table.Cell>
								<Table.Cell>{healthRecord.frequency}</Table.Cell>
								<Table.Cell>{healthRecord.duration}</Table.Cell>
								<Table.Cell>
									<ActionButton
										title="Edit"
										icon="i-material-symbols-edit-square-outline"
										disabled={!user}
									/>
									<ActionButton
										title="Delete"
										icon="i-material-symbols-delete-outline"
										disabled={!user}
									/>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</S.TableContainer>

			<S.InfoTableContainer>
				{animal.relatedAnimals.parents?.length !== 0 && (
					<S.TableContainer>
						<S.CenterTitle>
							<S.Label>Parents Related Animals</S.Label>
							<ActionButton
								title="Add Parent"
								icon="i-material-symbols-add-circle-outline"
								disabled={!user}
							/>
						</S.CenterTitle>
						<Table>
							<Table.Head>
								<Table.Row>
									<Table.HeadCell>Animal ID</Table.HeadCell>
									<Table.HeadCell>Breed</Table.HeadCell>
									<Table.HeadCell>Relation</Table.HeadCell>
									<Table.HeadCell>Actions</Table.HeadCell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{animal.relatedAnimals.parents?.map((parent) => (
									<Table.Row key={crypto.randomUUID()}>
										<Table.Cell>{parent.animalId}</Table.Cell>
										<Table.Cell>{parent.breed}</Table.Cell>
										<Table.Cell>{parent.relation}</Table.Cell>
										<Table.Cell>
											<ActionButton title="View" icon="i-material-symbols-visibility-outline" />
											<ActionButton
												title="Edit"
												icon="i-material-symbols-edit-square-outline"
												disabled={!user}
											/>
											<ActionButton
												title="Delete"
												icon="i-material-symbols-delete-outline"
												disabled={!user}
											/>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</S.TableContainer>
				)}

				{animal.relatedAnimals.children?.length !== 0 && (
					<S.TableContainer>
						<S.CenterTitle>
							<S.Label>Children Related Animals</S.Label>
							<ActionButton
								title="Add Child"
								icon="i-material-symbols-add-circle-outline"
								disabled={!user}
							/>
						</S.CenterTitle>
						<Table>
							<Table.Head>
								<Table.Row>
									<Table.HeadCell>Animal ID</Table.HeadCell>
									<Table.HeadCell>Breed</Table.HeadCell>
									<Table.HeadCell>Relation</Table.HeadCell>
									<Table.HeadCell>Actions</Table.HeadCell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{animal.relatedAnimals.children?.map((child) => (
									<Table.Row key={crypto.randomUUID()}>
										<Table.Cell>{child.animalId}</Table.Cell>
										<Table.Cell>{child.breed}</Table.Cell>
										<Table.Cell>{child.relation}</Table.Cell>
										<Table.Cell>
											<ActionButton title="View" icon="i-material-symbols-visibility-outline" />
											<ActionButton
												title="Edit"
												icon="i-material-symbols-edit-square-outline"
												disabled={!user}
											/>
											<ActionButton
												title="Delete"
												icon="i-material-symbols-delete-outline"
												disabled={!user}
											/>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</S.TableContainer>
				)}
			</S.InfoTableContainer>
		</S.Container>
	)
}

const ANIMAL_INITIAL_STATE: AnimalInformation = {
	uuid: '',
	animalId: 0,
	species: 'Cow',
	breed: '',
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	relatedAnimals: {
		parents: [],
		children: [],
	},
	healthRecords: [],
	birthDate: undefined,
	purchaseDate: undefined,
}
