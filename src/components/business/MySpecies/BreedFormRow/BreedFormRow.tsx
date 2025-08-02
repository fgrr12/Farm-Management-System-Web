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
		<div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
			<div className="flex flex-col sm:flex-row gap-3">
				{/* Breed Name */}
				<div className="flex-1">
					<label
						htmlFor={`breed-name-${breed.uuid}`}
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						{t('breed')}
					</label>
					<TextField
						id={`breed-name-${breed.uuid}`}
						name="name"
						type="text"
						value={breed.name}
						onChange={(e) => handleFieldChange('name', e.target.value)}
						required={editable}
						disabled={!editable}
						placeholder={t('breed')}
						error={editable ? getFieldError('name') : undefined}
						className="w-full"
					/>
				</div>

				{/* Gestation Period */}
				<div className="flex-1">
					<label
						htmlFor={`breed-gestation-${breed.uuid}`}
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						{t('gestation')}
					</label>
					<div className="relative">
						<TextField
							id={`breed-gestation-${breed.uuid}`}
							name="gestationPeriod"
							type="number"
							value={breed.gestationPeriod}
							onChange={(e) => handleFieldChange('gestationPeriod', Number(e.target.value))}
							onWheel={(e) => e.currentTarget.blur()}
							required={editable}
							disabled={!editable}
							placeholder="0"
							error={editable ? getFieldError('gestationPeriod') : undefined}
							className="w-full pr-12"
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<span className="text-sm text-gray-500 dark:text-gray-400">{t('days')}</span>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-center sm:justify-end sm:mt-6">
					{editable && (
						<ActionButton
							type="button"
							title={t('removeButton')}
							icon="i-material-symbols-delete-outline"
							onClick={() => onRemove(breed.uuid)}
							className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
						/>
					)}
				</div>
			</div>

			{/* Error Messages */}
			{editable && (getFieldError('name') || getFieldError('gestationPeriod')) && (
				<div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
					<div className="text-sm text-red-700 dark:text-red-300">
						{getFieldError('name') && <p>{getFieldError('name')}</p>}
						{getFieldError('gestationPeriod') && <p>{getFieldError('gestationPeriod')}</p>}
					</div>
				</div>
			)}
		</div>
	)
})
