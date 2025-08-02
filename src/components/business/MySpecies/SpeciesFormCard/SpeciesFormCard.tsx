import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'

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

		// biome-ignore lint: ignore unnecessary things
		useEffect(() => {
			if (specie.editable) {
				speciesForm.resetWithData(specie)
			}
		}, [specie])

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
			<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
				<form onSubmit={handleFormSubmit} noValidate>
					{/* Header with gradient based on editable state */}
					<div
						className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
							specie.editable
								? 'bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30'
								: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3 flex-1">
								<div
									className={`w-3 h-3 rounded-full ${specie.editable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
								/>
								<div className="flex-1">
									<input
										name="name"
										type="text"
										value={specie.name}
										onChange={(e) => handleSpecieFieldChange('name', e.target.value)}
										required={specie.editable}
										disabled={!specie.editable}
										placeholder={t('speciesName')}
										className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
									/>
									{specie.editable && getFieldError('name') && (
										<p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<ActionButton
									type="button"
									title={t('editButton')}
									icon="i-material-symbols-edit-square-outline"
									onClick={() => onEdit(specie.uuid)}
									className={`p-2 rounded-lg transition-colors ${specie.editable ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
								/>
								<ActionButton
									type="button"
									title={t('deleteButton')}
									icon="i-material-symbols-delete-outline"
									onClick={() => onRemove(specie.uuid)}
									className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
								/>
							</div>
						</div>
					</div>

					{/* Breeds Section */}
					<div className="p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<i className="i-material-symbols-pets w-5! h-5! bg-gray-600!" />
								<h3 className="font-semibold text-gray-900 dark:text-white">
									{t('breeds')} ({specieBreeds.length})
								</h3>
							</div>

							{specie.editable && (
								<ActionButton
									type="button"
									title={t('addBreed')}
									icon="i-material-symbols-add-circle-outline"
									onClick={() => onAddBreed(specie.uuid)}
									className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
								>
									<span className="ml-1">{t('addBreed')}</span>
								</ActionButton>
							)}
						</div>

						{/* Breeds List */}
						{specieBreeds.length === 0 ? (
							<div className="text-center py-8">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
									<i className="i-material-symbols-pets w-8! h-8! bg-gray-400!" />
								</div>
								<p className="text-gray-500 dark:text-gray-400 mb-4">{t('noBreedsYet')}</p>
								{specie.editable && (
									<ActionButton
										type="button"
										icon="i-material-symbols-add-circle-outline"
										onClick={() => onAddBreed(specie.uuid)}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
									>
										{t('addFirstBreed')}
									</ActionButton>
								)}
							</div>
						) : (
							<div className="space-y-3">
								{specieBreeds.map((breed) => (
									<BreedFormRow
										key={breed.uuid}
										breed={breed}
										editable={specie.editable}
										onChange={onBreedChange}
										onRemove={onRemoveBreed}
									/>
								))}
							</div>
						)}
					</div>

					{/* Action Section */}
					{specie.editable && (
						<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
							<div className="flex flex-col gap-3">
								<Button
									type="submit"
									disabled={!specie.editable || speciesForm.formState.isSubmitting}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors relative"
								>
									{speciesForm.formState.isSubmitting && (
										<div className="absolute inset-0 flex items-center justify-center bg-blue-600/90">
											<div className="flex items-center gap-2">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
												<span>{t('saving')}</span>
											</div>
										</div>
									)}
									<span
										className={speciesForm.formState.isSubmitting ? 'opacity-0' : 'opacity-100'}
									>
										<i className="i-material-symbols-save w-5! h-5! mr-2" />
										{t('saveButton')}
									</span>
								</Button>

								<div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
									<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
									<span>
										{t('editModeActive')} • {t('unsavedChanges')}
									</span>
								</div>
							</div>
						</div>
					)}
				</form>
			</div>
		)
	}
)
