import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { useSpeciesForm } from '@/hooks/forms/useSpeciesForm'

import type { MySpeciesI } from '../../../../pages/MySpecies/MySpecies.types'
import { BreedFormRow } from '../BreedFormRow'

interface SpeciesFormCardProps {
	specie: MySpeciesI
	breeds: Breed[]
	onSpecieChange: (specieUuid: string, field: keyof Species, value: string | number) => void
	onBreedChange: (breedUuid: string, field: keyof Breed, value: string | number) => void
	onAddBreed: (specieUuid: string) => void
	onRemoveBreed: (breedUuid: string) => void
	onEdit: (specieUuid: string) => void
	onRemove: (specieUuid: string) => void
	onSubmit: (specieData: Species, breedData: Breed[]) => Promise<void>
}

export const SpeciesFormCard = memo(
	({
		specie,
		breeds,
		onSpecieChange,
		onBreedChange,
		onAddBreed,
		onRemoveBreed,
		onEdit,
		onRemove,
		onSubmit,
	}: SpeciesFormCardProps) => {
		const { t } = useTranslation(['mySpecies'])

		const speciesForm = useSpeciesForm(specie)

		const specieBreeds = breeds.filter((breed) => breed.speciesUuid === specie.uuid)

		useEffect(() => {
			if (specie.editable) {
				speciesForm.resetWithData(specie)
			}
		}, [specie, speciesForm])

		const handleSpecieFieldChange = useCallback(
			(field: keyof Species, value: string | number) => {
				if (specie.editable) {
					speciesForm.setValue(field as any, value)
					onSpecieChange(specie.uuid, field, value)
				}
			},
			[specie.editable, specie.uuid, speciesForm, onSpecieChange]
		)

		const handleFormSubmit = useCallback(
			async (e: React.FormEvent) => {
				e.preventDefault()

				if (!specie.editable) return

				const isSpeciesValid = await speciesForm.trigger()
				if (!isSpeciesValid) {
					return
				}

				const speciesData = speciesForm.transformToApiFormat(speciesForm.getValues())

				await onSubmit(speciesData, specieBreeds)
			},
			[specie.editable, speciesForm, specieBreeds, onSubmit]
		)

		const getFieldError = useCallback(
			(fieldName: string) => {
				const error =
					speciesForm.formState.errors[fieldName as keyof typeof speciesForm.formState.errors]
				return error ? speciesForm.getErrorMessage(error.message || '') : undefined
			},
			[speciesForm]
		)

		return (
			<div className="flex flex-col w-full gap-4 p-4 border-2 rounded-xl border-gray-300">
				<form onSubmit={handleFormSubmit} noValidate>
					<header className="flex flex-row justify-between items-center">
						<div className="text-xl font-bold flex-1">
							<TextField
								name="name"
								type="text"
								value={specie.name}
								onChange={(e) => handleSpecieFieldChange('name', e.target.value)}
								required={specie.editable}
								disabled={!specie.editable}
								placeholder={t('speciesName')}
								error={specie.editable ? getFieldError('name') : undefined}
							/>
						</div>
						<div className="flex flex-row justify-end items-center mt-4 ml-4">
							<ActionButton
								type="button"
								title={t('editButton')}
								icon="i-material-symbols-edit-square-outline"
								onClick={() => onEdit(specie.uuid)}
							/>
							<ActionButton
								type="button"
								title={t('deleteButton')}
								icon="i-material-symbols-delete-outline"
								onClick={() => onRemove(specie.uuid)}
							/>
						</div>
					</header>

					<div className="grid grid-cols-5 items-center gap-4 w-full mt-4">
						<h3 className="font-semibold text-center col-span-2">{t('breed')}</h3>
						<h3 className="font-semibold text-center col-span-2">{t('gestationPeriod')}</h3>
						<ActionButton
							type="button"
							title={t('addButton')}
							icon="i-material-symbols-add-circle-outline"
							onClick={() => onAddBreed(specie.uuid)}
							disabled={!specie.editable}
						/>
					</div>

					{specieBreeds.map((breed) => (
						<BreedFormRow
							key={breed.uuid}
							breed={breed}
							editable={specie.editable}
							onChange={onBreedChange}
							onRemove={onRemoveBreed}
						/>
					))}

					<div className="mt-4">
						<Button type="submit" disabled={!specie.editable || speciesForm.formState.isSubmitting}>
							{speciesForm.formState.isSubmitting ? t('saving') : t('saveButton')}
						</Button>
					</div>
				</form>
			</div>
		)
	}
)
