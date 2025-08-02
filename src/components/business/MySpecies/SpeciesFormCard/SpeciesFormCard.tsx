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
			<form onSubmit={handleFormSubmit} noValidate>
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300">
					{/* Header with gradient - Same style as Animals/Dashboard */}
					<div
						className={`${specie.editable ? 'bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700' : 'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700'} px-4 sm:px-6 py-6 sm:py-8`}
					>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-pets bg-white! w-6! h-6! sm:w-8 sm:h-8" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 mb-2">
										<div
											className={`w-2 h-2 rounded-full ${
												specie.editable ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
											}`}
										/>
										<span className="text-xs font-medium text-white/80 uppercase tracking-wide">
											{specie.editable ? t('editing') : t('viewing')} {t('species')}
										</span>
									</div>
									<input
										name="name"
										type="text"
										value={specie.name}
										onChange={(e) => handleSpecieFieldChange('name', e.target.value)}
										required={specie.editable}
										disabled={!specie.editable}
										placeholder={t('speciesName')}
										className="text-2xl sm:text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg px-2 py-1 w-full placeholder-white/60"
									/>
									{specie.editable && getFieldError('name') && (
										<p className="text-red-200 text-sm mt-1">{getFieldError('name')}</p>
									)}
								</div>
							</div>

							{/* Action buttons */}
							<div className="flex items-center gap-2">
								<ActionButton
									type="button"
									title={t('editButton')}
									icon="i-material-symbols-edit-square-outline"
									onClick={() => onEdit(specie.uuid)}
									className={`bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 dark:border-white/25 hover:bg-white/20 transition-all duration-200 ${
										specie.editable ? 'bg-white/20' : ''
									}`}
								/>
								<ActionButton
									type="button"
									title={t('deleteButton')}
									icon="i-material-symbols-delete-outline"
									onClick={() => onRemove(specie.uuid)}
									className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 dark:border-white/25 hover:bg-white/20 transition-all duration-200"
								/>
							</div>
						</div>
					</div>

					{/* Content Section */}
					<div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
						{/* Breeds Section */}
						<div className="space-y-4">
							<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
											<i className="i-material-symbols-pets w-5! h-5! bg-blue-600! dark:bg-blue-400!" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
												{t('breeds')}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{specieBreeds.length} {specieBreeds.length === 1 ? 'breed' : 'breeds'}
											</p>
										</div>
									</div>

									<ActionButton
										type="button"
										title={t('addBreed')}
										icon="i-material-symbols-add-circle-outline"
										onClick={() => onAddBreed(specie.uuid)}
										disabled={!specie.editable}
										className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
											specie.editable
												? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
												: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
										}`}
									>
										<span className="hidden sm:inline ml-2">{t('addBreed')}</span>
									</ActionButton>
								</div>
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
									<div className="text-center py-16 px-4">
										<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center border border-gray-200 dark:border-gray-600">
											<i className="i-material-symbols-pets w-10! h-10! bg-gray-400! dark:bg-gray-500!" />
										</div>
										<h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
											{t('noBreedsYet')}
										</h4>
										<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
											{t('addFirstBreed')}
										</p>
										{specie.editable && (
											<ActionButton
												type="button"
												icon="i-material-symbols-add-circle-outline"
												onClick={() => onAddBreed(specie.uuid)}
												className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
											>
												{t('addFirstBreed')}
											</ActionButton>
										)}
									</div>
								) : (
									<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
										{specieBreeds.map((breed, index) => (
											<div
												key={breed.uuid}
												className={`transform transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
													index !== specieBreeds.length - 1
														? 'border-b border-gray-100 dark:border-gray-700'
														: ''
												}`}
												style={{ animationDelay: `${index * 100}ms` }}
											>
												<BreedFormRow
													breed={breed}
													editable={specie.editable}
													onChange={onBreedChange}
													onRemove={onRemoveBreed}
												/>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Action Section */}
						{specie.editable && (
							<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
								{/* Save Button */}
								<div className="flex justify-center sm:justify-end">
									<Button
										type="submit"
										disabled={!specie.editable || speciesForm.formState.isSubmitting}
										className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 min-w-[140px]"
									>
										{speciesForm.formState.isSubmitting && (
											<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600/90 to-green-600/90">
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
								</div>

								{/* Status Message */}

								<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
									<i className="i-material-symbols-info w-4! h-4! bg-blue-600! dark:bg-blue-400!" />
									<span className="text-sm text-blue-700 dark:text-blue-300">
										{t('editModeActive')} - {t('unsavedChanges')}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</form>
		)
	}
)
