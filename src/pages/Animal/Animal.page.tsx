// Styles
import { AnimalMock } from '@/mocks/Animal/Animal.mock'
import { useEffect, useState } from 'react'
import * as S from './Animal.styles'
import { IAnimal } from './Animal.types'

export const Animal: FC = () => {
	const [animal, setAnimal] = useState<IAnimal>(ANIMAL_INITIAL_STATE)

	useEffect(() => {
		setAnimal(AnimalMock)
	}, [setAnimal])

	return (
		<S.Container>
			<S.Image src={animal.picture} alt={animal.species} />
			<S.Info>
				<S.Label>Species</S.Label>
				<S.Value>{animal.species}</S.Value>
				<S.Label>Breed</S.Label>
				<S.Value>{animal.breed}</S.Value>
				<S.Label>Gender</S.Label>
				<S.Value>{animal.gender}</S.Value>
				<S.Label>Color</S.Label>
				<S.Value>{animal.color}</S.Value>
				<S.Label>Weight</S.Label>
				<S.Value>{animal.weight}</S.Value>
			</S.Info>

			<S.Info>
				<S.Label>Birth Date</S.Label>
				<S.Value>{animal.birthDate?.format('MM/DD/YYYY')}</S.Value>
				<S.Label>Purchase Date</S.Label>
				<S.Value>{animal.purchaseDate?.format('MM/DD/YYYY')}</S.Value>
			</S.Info>

			<S.Info>
				<S.Label>Related Animals</S.Label>
				{animal.relatedAnimal?.map((relatedAnimal) => (
					<div key={relatedAnimal.animalId}>
						<S.Label>Species</S.Label>
						<S.Value>{relatedAnimal.species}</S.Value>
						<S.Label>Breed</S.Label>
						<S.Value>{relatedAnimal.breed}</S.Value>
						<S.Label>Gender</S.Label>
						<S.Value>{relatedAnimal.gender}</S.Value>
						<S.Label>Relation</S.Label>
						<S.Value>{relatedAnimal.relation}</S.Value>
					</div>
				))}
			</S.Info>

			<S.Info>
				<S.Label>Health Records</S.Label>
				{animal.healthRecords?.map((healthRecord) => (
					<div key={healthRecord.animalId}>
						<S.Label>Reason</S.Label>
						<S.Value>{healthRecord.reason}</S.Value>
						<S.Label>Notes</S.Label>
						<S.Value>{healthRecord.notes}</S.Value>
						<S.Label>Type</S.Label>
						<S.Value>{healthRecord.type}</S.Value>
						<S.Label>Reviewed By</S.Label>
						<S.Value>{healthRecord.reviewedBy}</S.Value>
						<S.Label>Date</S.Label>
						<S.Value>{healthRecord.date.format('MM/DD/YYYY')}</S.Value>
						<S.Label>Weight</S.Label>
						<S.Value>{healthRecord.weight}</S.Value>
						<S.Label>Temperature</S.Label>
						<S.Value>{healthRecord.temperature}</S.Value>
						<S.Label>Heart Rate</S.Label>
						<S.Value>{healthRecord.heartRate}</S.Value>
						<S.Label>Blood Pressure</S.Label>
						<S.Value>{healthRecord.bloodPressure}</S.Value>
						<S.Label>Medication</S.Label>
						<S.Value>{healthRecord.medication}</S.Value>
						<S.Label>Dosage</S.Label>
						<S.Value>{healthRecord.dosage}</S.Value>
						<S.Label>Frequency</S.Label>
						<S.Value>{healthRecord.frequency}</S.Value>
						<S.Label>Duration</S.Label>
						<S.Value>{healthRecord.duration}</S.Value>
					</div>
				))}
			</S.Info>
		</S.Container>
	)
}

const ANIMAL_INITIAL_STATE: IAnimal = {
	animalId: 0,
	species: '',
	breed: '',
	gender: '',
	color: '',
	weight: 0,
}
