import { memo, useCallback, useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { BillingCardsService } from '@/services/billingCards'
import { FarmsService } from '@/services/farms'
import { UserService } from '@/services/user'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { useBillingCardForm } from '@/hooks/forms/useBillingCardForm'
import { useFarmForm } from '@/hooks/forms/useFarmForm'
import { useUserForm } from '@/hooks/forms/useUserForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const MyAccount = () => {
	const { user: currentUser, setUser: updateUser } = useUserStore()
	const {
		billingCard: currentBillingCard,
		farm: currentFarm,
		setFarm: updateFarm,
		setBillingCard: updateBillingCard,
	} = useFarmStore()
	const { t } = useTranslation(['myAccount'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [edit, setEdit] = useState(INITIAL_EDIT)

	const userForm = useUserForm()
	const farmForm = useFarmForm()
	const billingCardForm = useBillingCardForm()

	const { control: userControl } = userForm
	const { control: farmControl } = farmForm

	const languages = [
		{ value: 'spa', name: t('myProfile.languageList.spa') },
		{ value: 'eng', name: t('myProfile.languageList.eng') },
	]

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

	const handleEdit = useCallback(
		(key: 'farm' | 'user' | 'billingCard') => () => {
			setEdit((prev) => ({ ...prev, [key]: !prev[key] }))
		},
		[]
	)

	const handleSubmitUser = useCallback(
		async (data: any) => {
			await withLoadingAndError(async () => {
				const userData = userForm.transformToApiFormat(data)
				await UserService.updateUser(userData)
				updateUser(userData)
				setEdit((prev) => ({ ...prev, user: false }))
				showToast(t('myProfile.toast.edited'), 'success')
			}, t('myProfile.toast.errorEditing'))
		},
		[userForm, updateUser, withLoadingAndError, showToast, t]
	)

	const handleSubmitFarm = useCallback(
		async (data: any) => {
			console.log(data);

			await withLoadingAndError(async () => {
				const farmData = farmForm.transformToApiFormat(data)

				await FarmsService.updateFarm(farmData)
				updateFarm(farmData)
				setEdit((prev) => ({ ...prev, farm: false }))
				showToast(t('myFarm.toast.edited'), 'success')
			}, t('myFarm.toast.errorEditing'))
		},
		[farmForm, updateFarm, withLoadingAndError, showToast, t]
	)

	const handleSubmitBillingCard = useCallback(
		async (data: any) => {
			await withLoadingAndError(async () => {
				const billingCardData = billingCardForm.transformToApiFormat(data)

				if (data.uuid) {
					await BillingCardsService.updateBillingCard(billingCardData)
					showToast(t('myBillingCard.toast.edited'), 'success')
				} else {
					const updatedFarm = { ...currentFarm!, billingCardUuid: billingCardData.uuid }
					await BillingCardsService.setBillingCard(billingCardData)
					await FarmsService.updateFarm(updatedFarm)
					showToast(t('myBillingCard.toast.added'), 'success')
				}
				updateBillingCard(billingCardData)
				setEdit((prev) => ({ ...prev, billingCard: false }))
			}, t('myBillingCard.toast.errorEditing'))
		},
		[currentFarm, billingCardForm, updateBillingCard, withLoadingAndError, showToast, t]
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
		if (currentBillingCard) {
			billingCardForm.resetWithData(currentBillingCard)
		}
	}, [currentBillingCard])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="flex flex-col w-full h-full">
			<a
				href="#profile-section"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToProfile')}
			</a>

			<header>
				<h1 className="sr-only">{t('title')}</h1>
			</header>

			<section id="profile-section" className="flex flex-col p-4" aria-labelledby="profile-heading">
				<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
					<header className="flex items-center gap-4">
						<h2 id="profile-heading" className="text-xl font-bold">
							{t('myProfile.title')}
						</h2>
						<ActionButton
							title={t('accessibility.editProfile')}
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('user')}
							aria-label={
								edit.user ? t('accessibility.cancelEditProfile') : t('accessibility.editProfile')
							}
							aria-pressed={edit.user}
						/>
					</header>
					<p className="text-lg">{t('myProfile.subtitle')}</p>
					<form
						className="flex flex-col gap-4 w-full"
						onSubmit={userForm.handleSubmit(handleSubmitUser)}
						autoComplete="off"
						aria-labelledby="profile-heading"
						noValidate
					>
						<fieldset className="border-0 p-0 m-0">
							<legend className="sr-only">{t('accessibility.personalInformation')}</legend>
							<div className="grid grid-cols-3 items-center gap-4 w-full">
								<TextField
									{...userForm.register('name')}
									label={t('myProfile.name')}
									placeholder={t('myProfile.name')}
									disabled={!edit.user}
									required
									aria-describedby="name-help"
									autoComplete="given-name"
									error={userForm.formState.errors.name?.message}
								/>
								<div id="name-help" className="sr-only">
									{t('accessibility.nameHelp')}
								</div>

								<TextField
									{...userForm.register('lastName')}
									label={t('myProfile.lastName')}
									placeholder={t('myProfile.lastName')}
									disabled={!edit.user}
									required
									aria-describedby="lastName-help"
									autoComplete="family-name"
									error={userForm.formState.errors.lastName?.message}
								/>
								<div id="lastName-help" className="sr-only">
									{t('accessibility.lastNameHelp')}
								</div>

								<TextField
									{...userForm.register('email')}
									label={t('myProfile.email')}
									placeholder={t('myProfile.email')}
									disabled={!edit.user}
									required
									aria-describedby="email-help"
									autoComplete="email"
									type="email"
									error={userForm.formState.errors.email?.message}
								/>
								<div id="email-help" className="sr-only">
									{t('accessibility.emailHelp')}
								</div>
							</div>

							<div className="grid grid-cols-3 items-center gap-4 w-full">
								<TextField
									{...userForm.register('phone')}
									label={t('myProfile.phone')}
									placeholder={t('myProfile.phone')}
									disabled={!edit.user}
									required
									aria-describedby="phone-help"
									autoComplete="tel"
									type="tel"
									error={userForm.formState.errors.phone?.message}
								/>
								<div id="phone-help" className="sr-only">
									{t('accessibility.phoneHelp')}
								</div>

								<Controller
									name="language"
									control={userControl}
									render={({ field }) => (
										<Select
											{...field}
											legend={t('myProfile.selectLanguage')}
											defaultLabel={t('myProfile.selectLanguage')}
											items={languages}
											disabled={!edit.user}
											required
											aria-describedby="language-help"
											error={userForm.formState.errors.language?.message}
										/>
									)}
								/>
								<div id="language-help" className="sr-only">
									{t('accessibility.languageHelp')}
								</div>
							</div>
						</fieldset>

						<Button type="submit" disabled={!edit.user} aria-describedby="save-profile-help">
							{t('myProfile.edit')}
						</Button>
						<div id="save-profile-help" className="sr-only">
							{t('accessibility.saveProfileHelp')}
						</div>
					</form>
				</div>
			</section>

			{(currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
				<section className="flex flex-col p-4" aria-labelledby="farm-heading">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<header className="flex items-center gap-4">
							<h2 id="farm-heading" className="text-xl font-bold">
								{t('myFarm.title')}
							</h2>
							<ActionButton
								title={t('accessibility.editFarm')}
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('farm')}
								aria-label={
									edit.farm ? t('accessibility.cancelEditFarm') : t('accessibility.editFarm')
								}
								aria-pressed={edit.farm}
							/>
						</header>
						<p className="text-lg">{t('myFarm.subtitle')}</p>
						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={farmForm.handleSubmit(handleSubmitFarm)}
							autoComplete="off"
							aria-labelledby="farm-heading"
							noValidate
						>
							<fieldset className="border-0 p-0 m-0">
								<legend className="sr-only">{t('accessibility.farmInformation')}</legend>
								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										{...farmForm.register('name')}
										label={t('myFarm.name')}
										placeholder={t('myFarm.name')}
										disabled={!edit.farm}
										required
										aria-describedby="farm-name-help"
										autoComplete="organization"
										error={farmForm.formState.errors.name?.message}
									/>
									<div id="farm-name-help" className="sr-only">
										{t('accessibility.farmNameHelp')}
									</div>

									<TextField
										{...farmForm.register('address')}
										label={t('myFarm.address')}
										placeholder={t('myFarm.address')}
										disabled={!edit.farm}
										required
										aria-describedby="farm-address-help"
										autoComplete="street-address"
										error={farmForm.formState.errors.address?.message}
									/>
									<div id="farm-address-help" className="sr-only">
										{t('accessibility.farmAddressHelp')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<Controller
										name="liquidUnit"
										control={farmControl}
										render={({ field }) => (
											<Select
												{...field}
												legend={t('myFarm.liquidUnit')}
												defaultLabel={t('myFarm.liquidUnit')}
												items={liquidUnit}
												disabled={!edit.farm}
												required
												aria-describedby="liquid-unit-help"
												error={farmForm.formState.errors.liquidUnit?.message}
											/>
										)}
									/>
									<div id="liquid-unit-help" className="sr-only">
										{t('accessibility.liquidUnitHelp')}
									</div>

									<Controller
										name="weightUnit"
										control={farmControl}
										render={({ field }) => (
											<Select
												{...field}
												legend={t('myFarm.weightUnit')}
												defaultLabel={t('myFarm.weightUnit')}
												items={weightUnit}
												disabled={!edit.farm}
												required
												aria-describedby="weight-unit-help"
												error={farmForm.formState.errors.weightUnit?.message}
											/>
										)}
									/>
									<div id="weight-unit-help" className="sr-only">
										{t('accessibility.weightUnitHelp')}
									</div>

									<Controller
										name="temperatureUnit"
										control={farmControl}
										render={({ field }) => (
											<Select
												{...field}
												legend={t('myFarm.temperatureUnit')}
												defaultLabel={t('myFarm.temperatureUnit')}
												items={temperatureUnit}
												disabled={!edit.farm}
												required
												aria-describedby="temperature-unit-help"
												error={farmForm.formState.errors.temperatureUnit?.message}
											/>
										)}
									/>
									<div id="temperature-unit-help" className="sr-only">
										{t('accessibility.temperatureUnitHelp')}
									</div>
								</div>
							</fieldset>

							<Button type="submit" disabled={!edit.farm} aria-describedby="save-farm-help">
								{t('myFarm.edit')}
							</Button>
							<div id="save-farm-help" className="sr-only">
								{t('accessibility.saveFarmHelp')}
							</div>
						</form>
					</div>
				</section>
			)}

			{(currentUser?.role === 'admin' || currentUser?.role === 'owner') && (
				<section className="flex flex-col p-4" aria-labelledby="billing-heading">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<header className="flex items-center gap-4">
							<h2 id="billing-heading" className="text-xl font-bold">
								{t('myBillingCard.title')}
							</h2>
							<ActionButton
								title={t('accessibility.editBilling')}
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('billingCard')}
								aria-label={
									edit.billingCard
										? t('accessibility.cancelEditBilling')
										: t('accessibility.editBilling')
								}
								aria-pressed={edit.billingCard}
							/>
						</header>

						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={billingCardForm.handleSubmit(handleSubmitBillingCard)}
							autoComplete="off"
							aria-labelledby="billing-heading"
							noValidate
						>
							<fieldset className="border-0 p-0 m-0">
								<legend className="sr-only">{t('accessibility.billingInformation')}</legend>

								<div className="flex flex-row gap-4 w-full items-center">
									<p className="text-lg">{t('myBillingCard.subtitle')}</p>
									<label className="label flex items-center gap-2">
										<input
											{...billingCardForm.register('status')}
											type="checkbox"
											className="checkbox border-error bg-error checked:border-info checked:bg-info"
											disabled={!edit.billingCard}
											aria-describedby="billing-status-help"
										/>
										<span>
											{t(
												billingCardForm.watch('status')
													? 'myBillingCard.active'
													: 'myBillingCard.inactive'
											)}
										</span>
									</label>
									<div id="billing-status-help" className="sr-only">
										{t('accessibility.billingStatusHelp')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										{...billingCardForm.register('id')}
										label={t('myBillingCard.id')}
										placeholder={t('myBillingCard.id')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-id-help"
										error={billingCardForm.formState.errors.id?.message}
									/>
									<div id="billing-id-help" className="sr-only">
										{t('accessibility.billingIdHelp')}
									</div>

									<TextField
										{...billingCardForm.register('name')}
										label={t('myBillingCard.name')}
										placeholder={t('myBillingCard.name')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-name-help"
										autoComplete="name"
										error={billingCardForm.formState.errors.name?.message}
									/>
									<div id="billing-name-help" className="sr-only">
										{t('accessibility.billingNameHelp')}
									</div>

									<TextField
										{...billingCardForm.register('email')}
										label={t('myBillingCard.email')}
										placeholder={t('myBillingCard.email')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-email-help"
										autoComplete="email"
										type="email"
										error={billingCardForm.formState.errors.email?.message}
									/>
									<div id="billing-email-help" className="sr-only">
										{t('accessibility.billingEmailHelp')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										{...billingCardForm.register('phone')}
										label={t('myBillingCard.phone')}
										placeholder={t('myBillingCard.phone')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-phone-help"
										autoComplete="tel"
										type="tel"
										error={billingCardForm.formState.errors.phone?.message}
									/>
									<div id="billing-phone-help" className="sr-only">
										{t('accessibility.billingPhoneHelp')}
									</div>

									<TextField
										{...billingCardForm.register('address')}
										label={t('myBillingCard.address')}
										placeholder={t('myBillingCard.address')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-address-help"
										autoComplete="billing street-address"
										error={billingCardForm.formState.errors.address?.message}
									/>
									<div id="billing-address-help" className="sr-only">
										{t('accessibility.billingAddressHelp')}
									</div>
								</div>
							</fieldset>

							<Button
								type="submit"
								disabled={!edit.billingCard}
								aria-describedby="save-billing-help"
							>
								{t('myBillingCard.edit')}
							</Button>
							<div id="save-billing-help" className="sr-only">
								{t('accessibility.saveBillingHelp')}
							</div>
						</form>
					</div>
				</section>
			)}
		</div>
	)
}

const INITIAL_EDIT = {
	user: false,
	farm: false,
	billingCard: false,
}

export default memo(MyAccount)
