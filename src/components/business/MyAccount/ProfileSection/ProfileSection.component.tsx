import { type FC, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { TextField } from '@/components/ui/TextField'

import type { ProfileSectionProps } from './ProfileSection.types'

export const ProfileSection: FC<ProfileSectionProps> = ({
	userForm,
	isEditing,
	onToggleEdit,
	onSubmit,
}) => {
	const { t } = useTranslation(['myAccount'])

	const languages: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'spa', label: t('myProfile.languageList.spa') },
			{ value: 'eng', label: t('myProfile.languageList.eng') },
		],
		[t]
	)

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-gray-900/25 overflow-hidden">
			{/* Header */}
			<div className="bg-linear-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
							<i className="i-material-symbols-person bg-white! w-5! h-5!" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">{t('myProfile.title')}</h2>
							<p className="text-blue-100 text-sm">{t('myProfile.subtitle')}</p>
						</div>
					</div>
					<ActionButton
						title={t('accessibility.editProfile')}
						icon={isEditing ? 'i-material-symbols-close' : 'i-material-symbols-edit'}
						onClick={onToggleEdit}
						className="text-white hover:bg-white/20 rounded-full p-2"
						aria-label={
							isEditing ? t('accessibility.cancelEditProfile') : t('accessibility.editProfile')
						}
						aria-pressed={isEditing}
					/>
				</div>
			</div>

			{/* Form Content */}
			<div className="p-4 sm:p-6">
				<form
					className="space-y-6"
					onSubmit={userForm.handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-badge w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('personalInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...userForm.register('name')}
								label={t('myProfile.name')}
								placeholder={t('placeholders.name')}
								disabled={!isEditing}
								required
								autoComplete="given-name"
								error={userForm.formState.errors.name?.message}
							/>
							<TextField
								{...userForm.register('lastName')}
								label={t('myProfile.lastName')}
								placeholder={t('placeholders.lastName')}
								disabled={!isEditing}
								required
								autoComplete="family-name"
								error={userForm.formState.errors.lastName?.message}
							/>
						</div>
					</div>

					{/* Contact Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-contact-mail w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('contactInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...userForm.register('email')}
								label={t('myProfile.email')}
								placeholder={t('placeholders.email')}
								disabled={!isEditing}
								required
								autoComplete="email"
								type="email"
								error={userForm.formState.errors.email?.message}
							/>
							<TextField
								{...userForm.register('phone')}
								label={t('myProfile.phone')}
								placeholder={t('placeholders.phone')}
								disabled={!isEditing}
								required
								autoComplete="tel"
								type="tel"
								error={userForm.formState.errors.phone?.message}
							/>
						</div>
					</div>

					{/* Preferences */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
							<i className="i-material-symbols-settings w-4! h-4! text-gray-600 dark:text-gray-300" />
							{t('preferences')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Controller
								name="language"
								control={userForm.control}
								render={({ field }) => (
									<CustomSelect
										label={t('myProfile.selectLanguage')}
										placeholder={t('placeholders.language')}
										value={field.value}
										onChange={field.onChange}
										options={languages}
										disabled={!isEditing}
										required
										error={userForm.formState.errors.language?.message}
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
								{t('myProfile.edit')}
							</Button>
						</div>
					)}
				</form>
			</div>
		</div>
	)
}
