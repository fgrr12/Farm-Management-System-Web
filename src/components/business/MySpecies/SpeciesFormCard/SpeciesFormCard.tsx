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
			<div className="flex flex-col w-full gap-6 p-6 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
				<form onSubmit={handleFormSubmit} noValidate className="space-y-6">
					{/* Header Section */}
					<header className="space-y-4">
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-2">
									<div
										className={`w-3 h-3 rounded-full flex-shrink-0 ${
											specie.editable ? 'bg-blue-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'
										}`}
									/>
									<span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
										{specie.editable ? t('editing') : t('viewing')} {t('species')}
									</span>
								</div>
								<TextField
									name="name"
									type="text"
									value={specie.name}
									onChange={(e) => handleSpecieFieldChange('name', e.target.value)}
									required={specie.editable}
									disabled={!specie.editable}
									placeholder={t('speciesName')}
									error={specie.editable ? getFieldError('name') : undefined}
									className="text-xl font-bold"
									variant="outlined"
								/>
							</div>

							<div className="flex items-center gap-2 flex-shrink-0">
								<ActionButton
									type="button"
									title={t('editButton')}
									icon="i-material-symbols-edit-square-outline"
									onClick={() => onEdit(specie.uuid)}
									className={`transition-all duration-200 ${
										specie.editable
											? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
											: 'hover:bg-gray-100 dark:hover:bg-gray-800'
									}`}
								/>
								<ActionButton
									type="button"
									title={t('deleteButton')}
									icon="i-material-symbols-delete-outline"
									onClick={() => onRemove(specie.uuid)}
									className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
								/>
							</div>
						</div>
					</header>

					{/* Breeds Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<i className="i-material-symbols-pets w-5! h-5! bg-gray-600! dark:bg-gray-400!" />
									<h3 className="font-semibold text-gray-900 dark:text-gray-100">
										{t('breeds')} ({specieBreeds.length})
									</h3>
								</div>
							</div>

							<ActionButton
								type="button"
								title={t('addBreed')}
								icon="i-material-symbols-add-circle-outline"
								onClick={() => onAddBreed(specie.uuid)}
								disabled={!specie.editable}
							>
								<span className="hidden sm:inline ml-2">{t('addBreed')}</span>
							</ActionButton>
						</div>

						{/* Breeds Grid Header */}
						{specieBreeds.length > 0 && (
							<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="col-span-2">
									<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
										<i className="i-material-symbols-category w-4! h-4!" />
										{t('breed')}
									</h4>
								</div>
								<div className="col-span-2">
									<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
										<i className="i-material-symbols-schedule w-4! h-4!" />
										{t('gestationPeriod')}
									</h4>
								</div>
								<div className="text-center">
									<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
										{t('actions')}
									</h4>
								</div>
							</div>
						)}

						{/* Breeds List */}
						<div className="space-y-3">
							{specieBreeds.length === 0 ? (
								<div className="text-center py-12 px-4">
									<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
										<i className="i-material-symbols-pets w-8! h-8! bg-gray-400! dark:bg-gray-600!" />
									</div>
									<h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
										{t('noBreedsYet')}
									</h4>
									<p className="text-gray-600 dark:text-gray-400 mb-4">{t('addFirstBreed')}</p>
									{specie.editable && (
										<ActionButton
											type="button"
											icon="i-material-symbols-add-circle-outline"
											onClick={() => onAddBreed(specie.uuid)}
											className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-medium"
										>
											{t('addFirstBreed')}
										</ActionButton>
									)}
								</div>
							) : (
								specieBreeds.map((breed, index) => (
									<div
										key={breed.uuid}
										className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<BreedFormRow
											breed={breed}
											editable={specie.editable}
											onChange={onBreedChange}
											onRemove={onRemoveBreed}
										/>
									</div>
								))
							)}
						</div>
					</div>

					{/* Action Section */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<Button
							type="submit"
							disabled={!specie.editable || speciesForm.formState.isSubmitting}
							className={`flex-1 sm:flex-none sm:min-w-[120px] relative overflow-hidden ${
								specie.editable
									? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
									: 'bg-gray-400 dark:bg-gray-600'
							} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95`}
						>
							{speciesForm.formState.isSubmitting && (
								<div className="absolute inset-0 flex items-center justify-center bg-blue-600/90 dark:bg-blue-500/90">
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										<span>{t('saving')}</span>
									</div>
								</div>
							)}
							<span className={speciesForm.formState.isSubmitting ? 'opacity-0' : 'opacity-100'}>
								{t('saveButton')}
							</span>
						</Button>
					</div>

					{/* Status Bar */}
					{specie.editable && (
						<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<i className="i-material-symbols-info w-4! h-4! bg-blue-600! dark:bg-blue-400!" />
							<span className="text-sm text-blue-700 dark:text-blue-300">
								{t('editModeActive')} - {t('unsavedChanges')}
							</span>
						</div>
					)}
				</form>
			</div>
		)
	}
)
