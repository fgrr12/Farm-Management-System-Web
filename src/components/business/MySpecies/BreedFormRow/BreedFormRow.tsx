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
		<div className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200 group">
			<div className="flex flex-col sm:flex-row sm:items-start gap-4">
				{/* Breed Icon and Info */}
				<div className="flex items-center gap-3 flex-1">
					<div className="flex-1 min-w-0">
						<div className="mb-2">
							<TextField
								name="name"
								type="text"
								value={breed.name}
								onChange={(e) => handleFieldChange('name', e.target.value)}
								required={editable}
								disabled={!editable}
								placeholder={t('breed')}
								error={editable ? getFieldError('name') : undefined}
								className={`w-full ${!editable ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
							/>
						</div>
					</div>
				</div>

				{/* Gestation Period */}
				<div className="flex items-center gap-3 flex-1">
					<div className="flex-1 min-w-0">
						<div className="mb-2">
							<div className="relative">
								<TextField
									name="gestationPeriod"
									type="number"
									value={breed.gestationPeriod}
									onChange={(e) => handleFieldChange('gestationPeriod', Number(e.target.value))}
									onWheel={(e) => e.currentTarget.blur()}
									required={editable}
									disabled={!editable}
									placeholder={t('days')}
									error={editable ? getFieldError('gestationPeriod') : undefined}
									className={`w-full pr-12 ${!editable ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
								/>
								<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
									<span className="text-sm text-gray-500 dark:text-gray-400">{t('days')}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-center sm:justify-end">
					<div className="flex items-center gap-2">
						{editable && (
							<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
								<ActionButton
									type="button"
									title={t('removeButton')}
									icon="i-material-symbols-delete-outline"
									onClick={() => onRemove(breed.uuid)}
									disabled={!editable}
									className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:scale-110 transition-all duration-200"
								/>
							</div>
						)}
						{!editable && (
							<div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
								<i className="i-material-symbols-lock w-5! h-5! bg-gray-400! dark:bg-gray-500!" />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Error Messages */}
			{editable && (getFieldError('name') || getFieldError('gestationPeriod')) && (
				<div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
					<div className="flex items-start gap-2">
						<i className="i-material-symbols-error w-4! h-4! bg-red-500! mt-0.5 flex-shrink-0" />
						<div className="text-sm text-red-700 dark:text-red-300">
							{getFieldError('name') && <p>{getFieldError('name')}</p>}
							{getFieldError('gestationPeriod') && <p>{getFieldError('gestationPeriod')}</p>}
						</div>
					</div>
				</div>
			)}
		</div>
	)
})
