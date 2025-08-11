import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserStore } from '@/store/useUserStore'

import { FarmsService } from '@/services/farms'

import { Modal } from '@/components/layout/Modal'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import type { CreateFarmModalProps } from './CreateFarmModal.types'

export const CreateFarmModal = memo<CreateFarmModalProps>(({ isOpen, onClose, onFarmCreated }) => {
	const { t } = useTranslation(['common'])
	const { user } = useUserStore()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		billingCardUuid: '',
		liquidUnit: 'L' as LiquidUnit,
		weightUnit: 'Kg' as WeightUnit,
		temperatureUnit: '°C' as TemperatureUnit,
		status: true,
	})

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleSubmit = useCallback(async () => {
		if (!formData.name.trim()) return

		setLoading(true)
		try {
			formData.billingCardUuid = formData.billingCardUuid || ''
			const newFarm = await FarmsService.createFarm(formData, user!.uuid)

			onFarmCreated({ ...newFarm, ...formData })
			onClose()

			// Reset form
			setFormData({
				name: '',
				address: '',
				billingCardUuid: '',
				liquidUnit: 'L' as LiquidUnit,
				weightUnit: 'Kg' as WeightUnit,
				temperatureUnit: '°C' as TemperatureUnit,
				status: true,
			})
		} catch (error) {
			console.error('Error creating farm:', error)
		} finally {
			setLoading(false)
		}
	}, [formData, user, onFarmCreated, onClose])

	const handleCancel = useCallback(() => {
		onClose()
		// Reset form
		setFormData({
			name: '',
			address: '',
			billingCardUuid: '',
			liquidUnit: 'L' as LiquidUnit,
			weightUnit: 'Kg' as WeightUnit,
			temperatureUnit: '°C' as TemperatureUnit,
			status: true,
		})
	}, [onClose])

	const isFormValid = formData.name.trim().length > 0

	return (
		<Modal
			title={t('admin.createNewFarm')}
			open={isOpen}
			onAccept={isFormValid ? handleSubmit : undefined}
			onCancel={handleCancel}
			acceptText={t('admin.createFarm')}
			cancelText={t('modal.cancel')}
			loading={loading}
			loadingText={t('admin.creatingFarm')}
			acceptVariant="primary"
			size="lg"
		>
			<div className="space-y-4">
				{/* Farm Name */}
				<div>
					<TextField
						name="name"
						label={t('admin.farmName')}
						placeholder={t('admin.farmNamePlaceholder')}
						value={formData.name}
						onChange={handleInputChange}
						required
						disabled={loading}
					/>
				</div>

				{/* Address */}
				<div>
					<TextField
						name="address"
						label={t('admin.farmAddress')}
						placeholder={t('admin.farmAddressPlaceholder')}
						value={formData.address}
						onChange={handleInputChange}
						disabled={loading}
					/>
				</div>

				{/* Units Configuration */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<Select
							name="liquidUnit"
							legend={t('admin.liquidUnit')}
							value={formData.liquidUnit}
							onChange={handleSelectChange}
							disabled={loading}
							items={[
								{ value: 'L', name: t('admin.units.liters') },
								{ value: 'Gal', name: t('admin.units.gallons') },
							]}
						/>
					</div>

					<div>
						<Select
							name="weightUnit"
							legend={t('admin.weightUnit')}
							value={formData.weightUnit}
							onChange={handleSelectChange}
							disabled={loading}
							items={[
								{ value: 'Kg', name: t('admin.units.kg') },
								{ value: 'P', name: t('admin.units.lbs') },
							]}
						/>
					</div>

					<div>
						<Select
							name="temperatureUnit"
							legend={t('admin.temperatureUnit')}
							value={formData.temperatureUnit}
							onChange={handleSelectChange}
							disabled={loading}
							items={[
								{ value: '°C', name: t('admin.units.celsius') },
								{ value: '°F', name: t('admin.units.fahrenheit') },
							]}
						/>
					</div>
				</div>

				{/* Info message */}
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
					<div className="flex items-start gap-2">
						<i className="i-material-symbols-info w-5! h-5! bg-blue-600! dark:bg-blue-400! mt-0.5 flex-shrink-0" />
						<div className="text-sm text-blue-700 dark:text-blue-300">
							<p className="font-medium mb-1">{t('admin.createFarmInfo')}</p>
							<p className="text-xs opacity-80">{t('admin.createFarmInfoDetails')}</p>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
})

CreateFarmModal.displayName = 'CreateFarmModal'
