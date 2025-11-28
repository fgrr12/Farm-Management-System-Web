import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import type { TaxDetailsSectionProps } from './TaxDetailsSection.types'

export const TaxDetailsSection: FC<TaxDetailsSectionProps> = ({
	taxDetailsForm,
	isEditing,
	onToggleEdit,
	onSubmit,
}) => {
	const { t } = useTranslation(['myAccount'])
	const { fields, append, remove } = useFieldArray({
		control: taxDetailsForm.control,
		name: 'activities',
	})

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-gray-900/25 overflow-hidden">
			{/* Header */}
			<div className="bg-linear-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
							<i className="i-material-symbols-receipt-long bg-white! w-5! h-5!" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">{t('myTaxDetails.title')}</h2>
							<p className="text-slate-200 text-sm">{t('myTaxDetails.subtitle')}</p>
						</div>
					</div>
					<ActionButton
						title={t('accessibility.editTaxDetails')}
						icon={isEditing ? 'i-material-symbols-close' : 'i-material-symbols-edit'}
						onClick={onToggleEdit}
						className="text-white hover:bg-white/20 rounded-full p-2"
						aria-label={
							isEditing
								? t('accessibility.cancelEditTaxDetails')
								: t('accessibility.editTaxDetails')
						}
						aria-pressed={isEditing}
					/>
				</div>
			</div>

			{/* Form Content */}
			<div className="p-4 sm:p-6">
				<form
					className="space-y-6"
					onSubmit={taxDetailsForm.handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					{/* Status Toggle */}
					<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="flex items-center gap-3">
							<i className="i-material-symbols-toggle-on w-5! h-5! text-gray-600 dark:text-gray-300" />
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								{t('taxStatus')}
							</span>
						</div>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								{...taxDetailsForm.register('status')}
								type="checkbox"
								className="toggle toggle-primary"
								disabled={!isEditing}
							/>
							<span
								className={`text-sm font-medium ${
									taxDetailsForm.watch('status')
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'
								}`}
							>
								{t(
									taxDetailsForm.watch('status') ? 'myTaxDetails.active' : 'myTaxDetails.inactive'
								)}
							</span>
						</label>
					</div>

					{/* Tax Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-receipt w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('taxInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...taxDetailsForm.register('id')}
								label={t('myTaxDetails.id')}
								placeholder={t('placeholders.taxId')}
								disabled={!isEditing}
								required
								error={taxDetailsForm.formState.errors.id?.message}
							/>
							<TextField
								{...taxDetailsForm.register('name')}
								label={t('myTaxDetails.name')}
								placeholder={t('placeholders.taxName')}
								disabled={!isEditing}
								required
								error={taxDetailsForm.formState.errors.name?.message}
							/>
							<TextField
								{...taxDetailsForm.register('email')}
								label={t('myTaxDetails.email')}
								placeholder={t('placeholders.taxEmail')}
								type="email"
								disabled={!isEditing}
								required
								error={taxDetailsForm.formState.errors.email?.message}
							/>
							<TextField
								{...taxDetailsForm.register('phone')}
								label={t('myTaxDetails.phone')}
								placeholder={t('placeholders.taxPhone')}
								type="tel"
								disabled={!isEditing}
								required
								error={taxDetailsForm.formState.errors.phone?.message}
							/>
							<div className="md:col-span-2">
								<TextField
									{...taxDetailsForm.register('address')}
									label={t('myTaxDetails.address')}
									placeholder={t('placeholders.taxAddress')}
									disabled={!isEditing}
									required
									error={taxDetailsForm.formState.errors.address?.message}
								/>
							</div>

							{/* Activities Section */}
							<div className="md:col-span-2 space-y-3">
								<h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
									<i className="i-material-symbols-work w-4! h-4! text-gray-600 dark:text-gray-300" />
									{t('myTaxDetails.activities')}
								</h4>
								{isEditing && (
									<Button
										type="button"
										onClick={() => append({ name: '', code: '' })}
										className="btn-sm btn-outline flex items-center gap-1 my-5"
									>
										<i className="i-material-symbols-add w-4! h-4!" />
										{t('myTaxDetails.addActivity')}
									</Button>
								)}

								{fields.length === 0 && (
									<div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
										{t('myTaxDetails.noActivities')}
									</div>
								)}

								<div className="space-y-3">
									{fields.map((field, index) => (
										<div
											key={field.id}
											className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
										>
											<div className="flex items-start gap-3">
												<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
													<TextField
														{...taxDetailsForm.register(`activities.${index}.name`)}
														label={t('myTaxDetails.activityName')}
														placeholder={t('placeholders.activityName')}
														disabled={!isEditing}
														required
														error={
															taxDetailsForm.formState.errors.activities?.[index]?.name?.message
														}
													/>
													<TextField
														{...taxDetailsForm.register(`activities.${index}.code`)}
														label={t('myTaxDetails.activityCode')}
														placeholder={t('placeholders.activityCode')}
														disabled={!isEditing}
														required
														error={
															taxDetailsForm.formState.errors.activities?.[index]?.code?.message
														}
													/>
												</div>
												{isEditing && (
													<button
														type="button"
														onClick={() => remove(index)}
														className="mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
														title={t('myTaxDetails.removeActivity')}
													>
														<i className="i-material-symbols-delete w-5! h-5!" />
													</button>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					{isEditing && (
						<div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								className="btn-primary"
								disabled={
									!taxDetailsForm.formState.isValid || taxDetailsForm.formState.isSubmitting
								}
							>
								{taxDetailsForm.formState.isSubmitting ? (
									<>
										<span className="loading loading-spinner loading-sm mr-2" />
										{t('myTaxDetails.saving')}
									</>
								) : (
									<>
										<i className="i-material-symbols-save w-4! h-4! mr-2" />
										{t('myTaxDetails.save')}
									</>
								)}
							</Button>
						</div>
					)}
				</form>
			</div>
		</div>
	)
}
