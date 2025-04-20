import { useUserStore } from '@/store/useUserStore'
import { type ChangeEvent, type FormEventHandler, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RelatedAnimalsService } from '@/services/relatedAnimals'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'
import type { ExternalRelation, ExternalRelationFormProps } from './ExternalRelationForm.types'

export const ExternalRelationForm: FC<ExternalRelationFormProps> = ({ currentAnimal }) => {
	const { t } = useTranslation(['externalRelationForm'])
	const [relation, setRelation] = useState<ExternalRelation>(INITIAL_RELATION)
	const { user } = useUserStore()

	const handleClose = () => {
		setRelation(INITIAL_RELATION)
		document?.querySelector('dialog')?.close()
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target
		if (name === 'breed') {
			setRelation({
				...relation,
				breed: {
					name: value,
					uuid: '-1',
					gestationPeriod: 0,
				},
			})
		} else {
			setRelation({ ...relation, [name]: value })
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()
		const uuid = self.crypto.randomUUID()
		if (relation.relation === 'Parent') {
			await handleAddRelatedAnimal({ ...relation, uuid }, currentAnimal)
		} else {
			await handleAddRelatedAnimal(currentAnimal, { ...relation, uuid })
		}
		document?.querySelector('dialog')?.close()
	}

	const buildRelation = (info: RelatedAnimalInformation, isChild: boolean) => ({
		animalUuid: info.uuid,
		animalId: info.animalId,
		breed: info.breed,
		relation:
			info.gender.toLowerCase() === Gender.FEMALE
				? isChild
					? Relation.DAUGHTER
					: Relation.MOTHER
				: isChild
					? Relation.SON
					: Relation.FATHER,
	})

	const handleAddRelatedAnimal = async (
		child: RelatedAnimalInformation,
		parent: RelatedAnimalInformation
	) => {
		await RelatedAnimalsService.setRelatedAnimal(
			{
				uuid: crypto.randomUUID(),
				child: buildRelation(child, true),
				parent: buildRelation(parent, false),
			},
			user!.uuid
		)
	}

	return (
		<dialog className="modal">
			<div className="modal-box">
				<h3 className="font-bold text-lg text-center p-4">{t('title')}</h3>
				<div className="grid grid-cols-9 p-4">
					<button
						type="button"
						className={`btn ${relation.relation === 'Child' ? 'btn-success' : 'btn-error'} col-span-4`}
						onClick={() => setRelation({ ...relation, relation: 'Child' })}
					>
						{t('relation.parent')}
					</button>
					<div className="divider divider-horizontal m-0 w-auto!" />
					<button
						type="button"
						className={`btn ${relation.relation === 'Parent' ? 'btn-success' : 'btn-error'} col-span-4`}
						onClick={() => setRelation({ ...relation, relation: 'Parent' })}
					>
						{t('relation.child')}
					</button>
				</div>
				<form
					method="dialog"
					className="flex flex-col w-full h-full px-4 gap-4"
					autoComplete="off"
					onSubmit={handleSubmit}
				>
					<TextField
						label={t('animalId')}
						name="animalId"
						value={relation.animalId}
						onChange={handleChange}
						required
					/>
					<Select
						legend={t('gender')}
						name="gender"
						items={[
							{ value: 'Female', name: t('female') },
							{ value: 'Male', name: t('male') },
						]}
						value={relation.gender}
						onChange={handleChange}
						required
					/>
					<TextField
						label={t('breed')}
						name="breed"
						value={relation.breed.name}
						onChange={handleChange}
						required
					/>
					{relation.animalId && (
						<p>
							{t('newRelationPhrase', {
								currentAnimal: currentAnimal.animalId,
								animalId: relation.animalId,
								relation:
									relation.relation === 'Parent' ? t('relation.child') : t('relation.parent'),
							})}
						</p>
					)}
					<div className="grid grid-cols-3 gap-4">
						<div className=" col-span-2">
							<Button type="submit">{t('save')}</Button>
						</div>
						<button type="button" className="btn btn-error h-full" onClick={handleClose}>
							Cancelar
						</button>
					</div>
				</form>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={handleClose} />
			</form>
		</dialog>
	)
}

const INITIAL_RELATION: ExternalRelation = {
	animalId: '',
	breed: {
		name: '',
		uuid: '-1',
		gestationPeriod: 0,
	},
	gender: '',
	relation: 'Child',
}

enum Relation {
	MOTHER = 'Mother',
	FATHER = 'Father',
	SON = 'Son',
	DAUGHTER = 'Daughter',
}

enum Gender {
	FEMALE = 'female',
	MALE = 'male',
}
