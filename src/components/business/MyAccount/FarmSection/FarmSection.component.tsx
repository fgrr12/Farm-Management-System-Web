import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import type { FarmSectionProps } from './FarmSection.types'

export const FarmSection: FC<FarmSectionProps> = ({
	farmForm,
	isEditing,
	onToggleEdit,
	onSubmit,
}) => {
	const { t } = useTranslation(['myAccount'])

	const liquidUnit = [
		{ value: 'L', name: t('myFarm.liquidUnitList.L') },
		{ value: 'Gal', name: t('myFarm.liquidUnitList.Gal') },
	]

	const weightUnit = [
		{ value: 'Kg', name: t('myFarm.weightUnitList.Kg') },
		{ value: 'Lb', name: t('myFarm.weightUnitList.Lb') },
	]

	const temperatureUnit = [
		{ value: '°C', name: t('myFarm.temperatureUnitList.°C') },
		{ value: '°F', name: t('myFarm.temperatureUnitList.°F') },
	]

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-gray-900/25 overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 sm:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
							<i className="i-material-symbols-agriculture bg-white! w-5! h-5!" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">{t('myFarm.title')}</h2>
							<p className="text-green-100 text-sm">{t('myFarm.subtitle')}</p>
						</div>
					</div>
					<ActionButton
						title={t('accessibility.editFarm')}
						icon={isEditing ? 'i-material-symbols-close' : 'i-material-symbols-edit'}
						onClick={onToggleEdit}
						className="text-white hover:bg-white/20 rounded-full p-2"
						aria-label={isEditing ? t('accessibility.cancelEditFarm') : t('accessibility.editFarm')}
						aria-pressed={isEditing}
					/>
				</div>
			</div>

			{/* Form Content */}
			<div className="p-4 sm:p-6">
				<form
					className="space-y-6"
					onSubmit={farmForm.handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-info w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('basicInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...farmForm.register('name')}
								label={t('myFarm.name')}
								placeholder={t('placeholders.farmName')}
								disabled={!isEditing}
								required
								autoComplete="organization"
								error={farmForm.formState.errors.name?.message}
							/>
							<TextField
								{...farmForm.register('address')}
								label={t('myFarm.address')}
								placeholder={t('placeholders.farmAddress')}
								disabled={!isEditing}
								required
								autoComplete="street-address"
								error={farmForm.formState.errors.address?.message}
							/>
						</div>
					</div>

					{/* Units Configuration */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-straighten w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('unitsConfiguration')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Controller
								name="liquidUnit"
								control={farmForm.control}
								render={({ field }) => (
									<Select
										{...field}
										legend={t('myFarm.liquidUnit')}
										defaultLabel={t('placeholders.liquidUnit')}
										items={liquidUnit}
										disabled={!isEditing}
										required
										error={farmForm.formState.errors.liquidUnit?.message}
									/>
								)}
							/>
							<Controller
								name="weightUnit"
								control={farmForm.control}
								render={({ field }) => (
									<Select
										{...field}
										legend={t('myFarm.weightUnit')}
										defaultLabel={t('placeholders.weightUnit')}
										items={weightUnit}
										disabled={!isEditing}
										required
										error={farmForm.formState.errors.weightUnit?.message}
									/>
								)}
							/>
							<Controller
								name="temperatureUnit"
								control={farmForm.control}
								render={({ field }) => (
									<Select
										{...field}
										legend={t('myFarm.temperatureUnit')}
										defaultLabel={t('placeholders.temperatureUnit')}
										items={temperatureUnit}
										disabled={!isEditing}
										required
										error={farmForm.formState.errors.temperatureUnit?.message}
									/>
								)}
							/>
						</div>
					</div>

					{/* Submit Button */}
					{isEditing && (
						<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
							<Button
								type="submit"
								className="btn btn-primary w-full flex items-center justify-center gap-2"
							>
								<i className="i-material-symbols-save w-4! h-4!" />
								{t('myFarm.edit')}
							</Button>
						</div>
					)}
				</form>
			</div>
		</div>
	)
}
