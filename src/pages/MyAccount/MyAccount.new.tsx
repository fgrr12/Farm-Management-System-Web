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
				showToast(t('myUser.toast.edited'), 'success')
			}, t('myUser.toast.errorEditing'))
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

	// Initialize forms with current data
	useEffect(() => {
		if (currentUser) {
			userForm.resetWithData(currentUser)
		}
	}, [currentUser, userForm])

	useEffect(() => {
		if (currentFarm) {
			farmForm.resetWithData(currentFarm)
		}
	}, [currentFarm, farmForm])

	useEffect(() => {
		if (currentTaxDetails) {
			taxDetailsForm.resetWithData(currentTaxDetails)
		}
	}, [currentTaxDetails, taxDetailsForm])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8 space-y-6 sm:space-y-8">
				{/* Profile Section */}
				<ProfileSection
					userForm={userForm}
					isEditing={edit.user}
					onSubmit={handleSubmitUser}
					onToggleEdit={handleEdit('user')}
				/>

				{/* Farm Section */}
				<FarmSection
					farmForm={farmForm}
					isEditing={edit.farm}
					onSubmit={handleSubmitFarm}
					onToggleEdit={handleEdit('farm')}
				/>

				{/* Tax Details Section */}
				<TaxDetailsSection
					taxDetailsForm={taxDetailsForm}
					isEditing={edit.taxDetails}
					onSubmit={handleSubmitTaxDetails}
					onToggleEdit={handleEdit('taxDetails')}
				/>
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
