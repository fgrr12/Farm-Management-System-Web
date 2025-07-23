import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { TextField } from '@/components/ui/TextField'

import { useBreedForm } from '@/hooks/forms/useBreedForm'

interface BreedFormRowProps {
	breed: Breed
	editable: boolean
	onChange: (breedUuid: string, field: keyof Breed, value: string | number) => void
	onRemove: (breedUuid: string) => void
}

export const BreedFormRow = memo(({ breed, editable, onChange, onRemove }: BreedFormRowProps) => {
	const { t } = useTranslation(['mySpecies'])

	// Form hook for breed validation
	const breedForm = useBreedForm(breed)

	// biome-ignore lint: ignore unnecessary things
	useEffect(() => {
		if (editable) {
			breedForm.resetWithData(breed)
		}
	}, [breed, editable])

	const handleFieldChange = useCallback(
		(field: keyof Breed, value: string | number) => {
			if (editable) {
				breedForm.setValue(field as any, value)
				onChange(breed.uuid, field, value)
			}
		},
		[editable, breed.uuid, breedForm, onChange]
	)

	const getFieldError = useCallback(
		(fieldName: string) => {
			const error = breedForm.formState.errors[fieldName as keyof typeof breedForm.formState.errors]
			return error ? breedForm.getErrorMessage(error.message || '') : undefined
		},
		[breedForm]
	)

	return (
		<div className="grid grid-cols-5 items-start gap-4 w-full mt-2">
			<div className="col-span-2">
				<TextField
					name="name"
					type="text"
					value={breed.name}
					onChange={(e) => handleFieldChange('name', e.target.value)}
					required={editable}
					disabled={!editable}
					placeholder={t('breed')}
					error={editable ? getFieldError('name') : undefined}
				/>
			</div>
			<div className="col-span-2">
				<TextField
					name="gestationPeriod"
					type="number"
					value={breed.gestationPeriod}
					onChange={(e) => handleFieldChange('gestationPeriod', Number(e.target.value))}
					onWheel={(e) => e.currentTarget.blur()}
					required={editable}
					disabled={!editable}
					placeholder={t('gestationPeriod')}
					error={editable ? getFieldError('gestationPeriod') : undefined}
				/>
			</div>
			<ActionButton
				type="button"
				title={t('removeButton')}
				icon="i-material-symbols-delete-outline"
				onClick={() => onRemove(breed.uuid)}
				disabled={!editable}
			/>
		</div>
	)
})
