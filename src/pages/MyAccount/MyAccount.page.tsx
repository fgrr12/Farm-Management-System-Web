import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { FarmsService } from '@/services/farms'
import { TaxDetailsService } from '@/services/taxDetails'
import { UserService } from '@/services/user'

import { FarmSection } from '@/components/business/MyAccount/FarmSection'
import { ProfileSection } from '@/components/business/MyAccount/ProfileSection'
import { TaxDetailsSection } from '@/components/business/MyAccount/TaxDetailsSection'

import { useFarmForm } from '@/hooks/forms/useFarmForm'
import { useTaxDetailsForm } from '@/hooks/forms/useTaxDetailsForm'
import { useUserForm } from '@/hooks/forms/useUserForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const MyAccount = () => {
	const { user: currentUser, setUser: updateUser } = useUserStore()
	const {
		taxDetails: currentTaxDetails,
		farm: currentFarm,
		setFarm: updateFarm,
		setTaxDetails: updateTaxDetails,
	} = useFarmStore()
	const { t } = useTranslation(['myAccount'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [edit, setEdit] = useState(INITIAL_EDIT)

	const userForm = useUserForm()
	const farmForm = useFarmForm()
	const taxDetailsForm = useTaxDetailsForm()

	const handleEdit = useCallback(
		(key: 'farm' | 'user' | 'taxDetails') => () => {
			setEdit((prev) => ({ ...prev, [key]: !prev[key] }))
		},
		[]
	)

	const handleSubmitUser = useCallback(
		async (data: any) => {
			await withLoadingAndError(async () => {
				const userData = userForm.transformToApiFormat(data)
				await UserService.updateUser(userData, currentUser!.uuid)
				updateUser(userData)
				setEdit((prev) => ({ ...prev, user: false }))
				showToast(t('myProfile.toast.edited'), 'success')
			}, t('myProfile.toast.errorEditing'))
		},
		[currentUser, userForm, updateUser, withLoadingAndError, showToast, t]
	)

	const handleSubmitFarm = useCallback(
		async (data: any) => {
			await withLoadingAndError(async () => {
				const farmData = farmForm.transformToApiFormat(data)

				await FarmsService.updateFarm(farmData, currentUser!.uuid)
				updateFarm(farmData)
				setEdit((prev) => ({ ...prev, farm: false }))
				showToast(t('myFarm.toast.edited'), 'success')
			}, t('myFarm.toast.errorEditing'))
		},
		[currentUser, farmForm, updateFarm, withLoadingAndError, showToast, t]
	)

	const handleSubmitTaxDetails = useCallback(
		async (data: any) => {
			await withLoadingAndError(async () => {
				const taxDetailsData = taxDetailsForm.transformToApiFormat(data)

				if (data.uuid) {
					await TaxDetailsService.updateTaxDetails(
						taxDetailsData,
						currentUser!.uuid,
						currentFarm!.uuid
					)
					showToast(t('myTaxDetails.toast.edited'), 'success')
				} else {
					const updatedFarm = { ...currentFarm!, taxDetailsUuid: taxDetailsData.uuid }
					await TaxDetailsService.setTaxDetails(
						taxDetailsData,
						currentUser!.uuid,
						currentFarm!.uuid
					)
					await FarmsService.updateFarm(updatedFarm, currentUser!.uuid)
					showToast(t('myTaxDetails.toast.added'), 'success')
				}
				updateTaxDetails(taxDetailsData)
				setEdit((prev) => ({ ...prev, taxDetails: false }))
			}, t('myTaxDetails.toast.errorEditing'))
		},
		[currentFarm, taxDetailsForm, currentUser, updateTaxDetails, withLoadingAndError, showToast, t]
	)

	// biome-ignore lint: ignore form
	useEffect(() => {
		if (currentUser) {
			userForm.resetWithData(currentUser)
		}
	}, [currentUser])

	// biome-ignore lint: ignore form
	useEffect(() => {
		if (currentFarm) {
			farmForm.resetWithData(currentFarm)
		}
	}, [currentFarm])

	// biome-ignore lint: ignore form
	useEffect(() => {
		if (currentTaxDetails) {
			taxDetailsForm.resetWithData(currentTaxDetails)
		}
	}, [currentTaxDetails])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#profile-section"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToProfile')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-gray-900/50 overflow-hidden mb-6 sm:mb-8">
					<div className="bg-linear-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
								<i className="i-material-symbols-account-circle bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{t('title')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">{t('subtitle')}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Sections */}
				<div className="space-y-6">
					{/* Profile Section */}
					<section id="profile-section">
						<ProfileSection
							userForm={userForm}
							isEditing={edit.user}
							onToggleEdit={handleEdit('user')}
							onSubmit={handleSubmitUser}
						/>
					</section>

					{/* Farm Section - Only for admin/owner */}
					{(currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
						<section>
							<FarmSection
								farmForm={farmForm}
								isEditing={edit.farm}
								onToggleEdit={handleEdit('farm')}
								onSubmit={handleSubmitFarm}
							/>
						</section>
					)}

					{/* Billing Section - Only for admin/owner */}
					{(currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
						<section>
							<TaxDetailsSection
								taxDetailsForm={taxDetailsForm}
								isEditing={edit.taxDetails}
								onToggleEdit={handleEdit('taxDetails')}
								onSubmit={handleSubmitTaxDetails}
							/>
						</section>
					)}
				</div>
			</div>
		</div>
	)
}

const INITIAL_EDIT = {
	user: false,
	farm: false,
	taxDetails: false,
}

export default memo(MyAccount)
