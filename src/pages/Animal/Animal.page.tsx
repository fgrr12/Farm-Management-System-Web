import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { RelatedAnimalsTable } from '@/components/business/Animal/RelatedAnimalsTable'
import { ActionButton } from '@/components/ui/ActionButton'
import { PageHeader } from '@/components/ui/PageHeader'

import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'

import type { AnimalInformation } from './Animal.types'

import { HealthRecordsTable } from '@/components/business/Animal/HealthRecordsTable'
import { ProductionRecordsTable } from '@/components/business/Animal/ProductionRecordsTable'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'
import * as S from './Animal.styles'

export const Animal: FC = () => {
	const location = useLocation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animal, setAnimal] = useState<AnimalInformation>(ANIMAL_INITIAL_STATE)
	const [user] = useState<boolean>(true) // useState<UserInformation>(USER_INITIAL_STATE)

	const getAnimal = async () => {
		try {
			setLoading(true)
			const { pathname } = location
			const animalId = pathname.split('/').pop()

			const dbAnimal = await AnimalsService.getAnimal({ animalUuid: animalId! })
			const dbHealthRecords = await HealthRecordsService.getHealthRecords({ animalUuid: animalId! })
			const bdProductionRecords = await ProductionRecordsService.getProductionRecords({
				animalUuid: animalId!,
			})

			dbAnimal.healthRecords = dbHealthRecords
			dbAnimal.productionRecords = bdProductionRecords

			setAnimal(dbAnimal)
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

				<HealthRecordsTable healthRecords={animal.healthRecords} user={user} />

				<S.InfoTableContainer>
					<ProductionRecordsTable productionRecords={animal.productionRecords} user={user} />

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
