import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import type { BillingSectionProps } from './BillingSection.types'

export const BillingSection: FC<BillingSectionProps> = ({
	billingCardForm,
	isEditing,
	onToggleEdit,
	onSubmit,
}) => {
	const { t } = useTranslation(['myAccount'])

	return (
		<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
							<i className="i-material-symbols-credit-card bg-white! w-5! h-5!" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">{t('myBillingCard.title')}</h2>
							<p className="text-purple-100 text-sm">{t('myBillingCard.subtitle')}</p>
						</div>
					</div>
					<ActionButton
						title={t('accessibility.editBilling')}
						icon={isEditing ? 'i-material-symbols-close' : 'i-material-symbols-edit'}
						onClick={onToggleEdit}
						className="text-white hover:bg-white/20 rounded-full p-2"
						aria-label={
							isEditing ? t('accessibility.cancelEditBilling') : t('accessibility.editBilling')
						}
						aria-pressed={isEditing}
					/>
				</div>
			</div>

			{/* Form Content */}
			<div className="p-4 sm:p-6">
				<form
					className="space-y-6"
					onSubmit={billingCardForm.handleSubmit(onSubmit)}
					autoComplete="off"
					noValidate
				>
					{/* Status Toggle */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center gap-3">
							<i className="i-material-symbols-toggle-on w-5! h-5! text-gray-600" />
							<span className="text-sm font-medium text-gray-900">{t('billingStatus')}</span>
						</div>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								{...billingCardForm.register('status')}
								type="checkbox"
								className="toggle toggle-primary"
								disabled={!isEditing}
							/>
							<span
								className={`text-sm font-medium ${
									billingCardForm.watch('status') ? 'text-green-600' : 'text-red-600'
								}`}
							>
								{t(
									billingCardForm.watch('status')
										? 'myBillingCard.active'
										: 'myBillingCard.inactive'
								)}
							</span>
						</label>
					</div>

					{/* Billing Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
							<i className="i-material-symbols-receipt w-4! h-4! text-gray-600" />
							{t('billingInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...billingCardForm.register('id')}
								label={t('myBillingCard.id')}
								placeholder={t('placeholders.billingId')}
								disabled={!isEditing}
								required
								error={billingCardForm.formState.errors.id?.message}
							/>
							<TextField
								{...billingCardForm.register('name')}
								label={t('myBillingCard.name')}
								placeholder={t('placeholders.billingName')}
								disabled={!isEditing}
								required
								autoComplete="name"
								error={billingCardForm.formState.errors.name?.message}
							/>
						</div>
					</div>

					{/* Contact Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
							<i className="i-material-symbols-contact-mail w-4! h-4! text-gray-600" />
							{t('contactInformation')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<TextField
								{...billingCardForm.register('email')}
								label={t('myBillingCard.email')}
								placeholder={t('placeholders.billingEmail')}
								disabled={!isEditing}
								required
								autoComplete="email"
								type="email"
								error={billingCardForm.formState.errors.email?.message}
							/>
							<TextField
								{...billingCardForm.register('phone')}
								label={t('myBillingCard.phone')}
								placeholder={t('placeholders.billingPhone')}
								disabled={!isEditing}
								required
								autoComplete="tel"
								type="tel"
								error={billingCardForm.formState.errors.phone?.message}
							/>
						</div>
						<TextField
							{...billingCardForm.register('address')}
							label={t('myBillingCard.address')}
							placeholder={t('placeholders.billingAddress')}
							disabled={!isEditing}
							required
							autoComplete="billing street-address"
							error={billingCardForm.formState.errors.address?.message}
						/>
					</div>

					{/* Submit Button */}
					{isEditing && (
						<div className="pt-4 border-t border-gray-200">
							<Button
								type="submit"
								className="btn btn-primary w-full flex items-center justify-center gap-2"
							>
								<i className="i-material-symbols-save w-4! h-4!" />
								{t('myBillingCard.edit')}
							</Button>
						</div>
					)}
				</form>
			</div>
		</div>
	)
}
