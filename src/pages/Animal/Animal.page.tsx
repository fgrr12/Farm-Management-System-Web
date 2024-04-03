import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table } from '@/components/ui/Table'

import { AnimalsService } from '@/services/Animals'
import { useAppStore } from '@/store/useAppStore'

import type { AnimalInformation } from './Animal.types'

import * as S from './Animal.styles'

export const Animal: FC = () => {
	const location = useLocation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animal, setAnimal] = useState<AnimalInformation>(ANIMAL_INITIAL_STATE)
	const [user] = useState<boolean>(false) // useState<UserInformation>(USER_INITIAL_STATE)

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
		try {
			setLoading(true)
			const { pathname } = location
			const animalId = pathname.split('/').pop()

			const dbData = await AnimalsService.getAnimal({ animalUuid: animalId! })

			setAnimal(dbData)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'Ocurrió un error al obtener el animal',
				onAccept: () => defaultModalData,
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimal()
	}, [])

	return (
		<>
			<PageHeader>Animal {animal.animalId}</PageHeader>
			<S.Container>
				<S.AnimalContainer>
					<S.InfoContainer>
						<S.CenterTitle>
							<S.Label>Animal ID</S.Label>
							{user && <ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />}
							{user && <ActionButton title="Delete" icon="i-material-symbols-delete-outline" />}
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
						{user && (
							<ActionButton
								title="Add Health Record"
								icon="i-material-symbols-add-circle-outline"
							/>
						)}
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
								{user && <Table.HeadCell>Actions</Table.HeadCell>}
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{animal.healthRecords.map((healthRecord) => (
								<Table.Row key={crypto.randomUUID()}>
									<Table.Cell data-title="Reason">{healthRecord.reason}</Table.Cell>
									<Table.Cell data-title="Notes">{healthRecord.notes}</Table.Cell>
									<Table.Cell data-title="Type">{healthRecord.type}</Table.Cell>
									<Table.Cell data-title="Reviewed By">{healthRecord.reviewedBy}</Table.Cell>
									<Table.Cell data-title="Date">
										{dayjs(healthRecord.date).format('MM/DD/YYYY')}
									</Table.Cell>
									<Table.Cell data-title="Weight">{healthRecord.weight}</Table.Cell>
									<Table.Cell data-title="Temperature">{healthRecord.temperature}</Table.Cell>
									<Table.Cell data-title="Medication">{healthRecord.medication}</Table.Cell>
									<Table.Cell data-title="Dosage">{healthRecord.dosage}</Table.Cell>
									<Table.Cell data-title="Frequency">{healthRecord.frequency}</Table.Cell>
									<Table.Cell data-title="Duration">{healthRecord.duration}</Table.Cell>
									{user && (
										<Table.Cell data-title="Actions">
											<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
											<ActionButton title="Delete" icon="i-material-symbols-delete-outline" />
										</Table.Cell>
									)}
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</S.TableContainer>

				<S.InfoTableContainer>
					<S.TableContainer>
						<S.CenterTitle>
							<S.Label>Production Records</S.Label>
							{user && (
								<ActionButton
									title="Add Production Record"
									icon="i-material-symbols-add-circle-outline"
								/>
							)}
						</S.CenterTitle>
						<Table>
							<Table.Head>
								<Table.Row>
									<Table.HeadCell>Date</Table.HeadCell>
									<Table.HeadCell>Notes</Table.HeadCell>
									<Table.HeadCell>Quantity</Table.HeadCell>
									{user && <Table.HeadCell>Actions</Table.HeadCell>}
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{animal.productionRecords.map((productionRecord) => (
									<Table.Row key={crypto.randomUUID()}>
										<Table.Cell data-title="Date">
											{dayjs(productionRecord.date).format('MM/DD/YYYY')}
										</Table.Cell>
										<Table.Cell data-title="Type">{productionRecord.quantity}</Table.Cell>
										<Table.Cell data-title="Notes">{productionRecord.notes}</Table.Cell>
										{user && (
											<Table.Cell data-title="Actions">
												<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
												<ActionButton title="Delete" icon="i-material-symbols-delete-outline" />
											</Table.Cell>
										)}
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</S.TableContainer>

					<RelatedAnimalsTable
						title="Parents Related Animals"
						animals={animal.relatedAnimals.parents!}
						user={user}
					/>

					<RelatedAnimalsTable
						title="Children Related Animals"
						animals={animal.relatedAnimals.children!}
						user={user}
					/>
				</S.InfoTableContainer>
			</S.Container>
		</>
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
	productionRecords: [],
	birthDate: undefined,
	purchaseDate: undefined,
	soldDate: undefined,
	deathDate: undefined,
}
