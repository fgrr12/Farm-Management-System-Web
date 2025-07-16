import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { BillingCardsService } from '@/services/billingCards'
import { FarmsService } from '@/services/farms'
import { UserService } from '@/services/user'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

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

	const [user, setUser] = useState<User>(INITIAL_USER_DATA)
	const [farm, setFarm] = useState<Farm>(INITIAL_FARM_DATA)
	const [billingCard, setBillingCard] = useState<BillingCard>(INITIAL_BILLING_CARD)
	const [edit, setEdit] = useState(INITIAL_EDIT)

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

	const handleChange =
		<T extends 'farm' | 'user' | 'billingCard'>(key: T) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const { name, value, type } = event.target
			const newValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value

			if (key === 'user') {
				setUser((prev) => ({
					...prev,
					[name]: type === 'text' ? capitalizeFirstLetter(newValue as string) : newValue,
				}))
			} else if (key === 'farm') {
				setFarm((prev) => ({
					...prev,
					[name]: type === 'text' ? capitalizeFirstLetter(newValue as string) : newValue,
				}))
			} else {
				setBillingCard((prev) => ({
					...prev,
					[name]: type === 'text' ? capitalizeFirstLetter(newValue as string) : newValue,
				}))
			}
		}

	const handleSubmitUser = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()

			await withLoadingAndError(async () => {
				await UserService.updateUser(user)
				updateUser(user)
				setEdit((prev) => ({ ...prev, user: false }))
				showToast(t('myProfile.toast.edited'), 'success')
			}, t('myProfile.toast.errorEditing'))
		},
		[user, updateUser, withLoadingAndError, showToast, t]
	)

	const handleSubmitFarm = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()

			await withLoadingAndError(async () => {
				await FarmsService.updateFarm({ ...farm })
				updateFarm({ ...farm })
				setEdit((prev) => ({ ...prev, farm: false }))
				showToast(t('myFarm.toast.edited'), 'success')
			}, t('myFarm.toast.errorEditing'))
		},
		[farm, updateFarm, withLoadingAndError, showToast, t]
	)

	const handleSubmitBillingCard = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()

			await withLoadingAndError(async () => {
				const uuid = billingCard.uuid ?? crypto.randomUUID()
				if (billingCard.uuid) {
					await BillingCardsService.updateBillingCard(billingCard)
					updateFarm({ ...farm })
					showToast(t('myBillingCard.toast.edited'), 'success')
				} else {
					farm.billingCardUuid = uuid
					billingCard.uuid = uuid
					await BillingCardsService.setBillingCard(billingCard)
					await FarmsService.updateFarm({ ...farm })
					showToast(t('myBillingCard.toast.added'), 'success')
				}
				updateBillingCard(billingCard)
				setEdit((prev) => ({ ...prev, billingCard: false }))
			}, t('myBillingCard.toast.errorEditing'))
		},
		[billingCard, farm, updateFarm, updateBillingCard, withLoadingAndError, showToast, t]
	)

	// biome-ignore lint:: useEffect is only called once
	useEffect(() => {
		if (!user || !currentFarm) return

		setUser(currentUser!)
		setFarm({ ...currentFarm! })
		setBillingCard({ ...currentBillingCard! })
	}, [currentUser, currentFarm])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])
	return (
		<div className="flex flex-col w-full h-full">
			<a
				href="#profile-section"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('skipToProfile', 'Skip to profile section')}
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
							title={t('editProfile', 'Edit profile')}
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('user')}
							aria-label={
								edit.user
									? t('cancelEditProfile', 'Cancel editing profile')
									: t('editProfile', 'Edit profile')
							}
							aria-pressed={edit.user}
						/>
					</header>
					<p className="text-lg">{t('myProfile.subtitle')}</p>
					<form
						className="flex flex-col gap-4 w-full"
						onSubmit={handleSubmitUser}
						autoComplete="off"
						aria-labelledby="profile-heading"
						noValidate
					>
						<fieldset className="border-0 p-0 m-0">
							<legend className="sr-only">
								{t('personalInformation', 'Personal information')}
							</legend>
							<div className="grid grid-cols-3 items-center gap-4 w-full">
								<TextField
									name="name"
									label={t('myProfile.name')}
									placeholder={t('myProfile.name')}
									value={user.name}
									onChange={handleChange('user')}
									disabled={!edit.user}
									required
									aria-describedby="name-help"
									autoComplete="given-name"
								/>
								<div id="name-help" className="sr-only">
									{t('nameHelp', 'Enter your first name')}
								</div>

								<TextField
									name="lastName"
									label={t('myProfile.lastName')}
									placeholder={t('myProfile.lastName')}
									value={user.lastName}
									onChange={handleChange('user')}
									disabled={!edit.user}
									required
									aria-describedby="lastname-help"
									autoComplete="family-name"
								/>
								<div id="lastname-help" className="sr-only">
									{t('lastNameHelp', 'Enter your last name')}
								</div>

								<TextField
									name="email"
									label={t('myProfile.email')}
									placeholder={t('myProfile.email')}
									value={user.email}
									onChange={handleChange('user')}
									disabled={!edit.user}
									required
									aria-describedby="email-help"
									autoComplete="email"
									type="email"
								/>
								<div id="email-help" className="sr-only">
									{t('emailHelp', 'Enter your email address')}
								</div>
							</div>

							<div className="grid grid-cols-3 items-center gap-4 w-full">
								<TextField
									name="phone"
									label={t('myProfile.phone')}
									placeholder={t('myProfile.phone')}
									value={user.phone}
									onChange={handleChange('user')}
									disabled={!edit.user}
									required
									aria-describedby="phone-help"
									autoComplete="tel"
									type="tel"
								/>
								<div id="phone-help" className="sr-only">
									{t('phoneHelp', 'Enter your phone number')}
								</div>

								<Select
									name="language"
									legend={t('myProfile.selectLanguage')}
									defaultLabel={t('myProfile.selectLanguage')}
									value={user.language}
									items={languages}
									onChange={handleChange('user')}
									disabled={!edit.user}
									required
									aria-describedby="language-help"
								/>
								<div id="language-help" className="sr-only">
									{t('languageHelp', 'Select your preferred language')}
								</div>
							</div>
						</fieldset>

						<Button type="submit" disabled={!edit.user} aria-describedby="save-profile-help">
							{t('myProfile.edit')}
						</Button>
						<div id="save-profile-help" className="sr-only">
							{t('saveProfileHelp', 'Save changes to your profile information')}
						</div>
					</form>
				</div>
			</section>
			{(user.role === 'admin' || user.role === 'owner') && (
				<section className="flex flex-col p-4" aria-labelledby="farm-heading">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<header className="flex items-center gap-4">
							<h2 id="farm-heading" className="text-xl font-bold">
								{t('myFarm.title')}
							</h2>
							<ActionButton
								title={t('editFarm', 'Edit farm')}
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('farm')}
								aria-label={
									edit.farm
										? t('cancelEditFarm', 'Cancel editing farm')
										: t('editFarm', 'Edit farm')
								}
								aria-pressed={edit.farm}
							/>
						</header>
						<p className="text-lg">{t('myFarm.subtitle')}</p>
						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={handleSubmitFarm}
							autoComplete="off"
							aria-labelledby="farm-heading"
							noValidate
						>
							<fieldset className="border-0 p-0 m-0">
								<legend className="sr-only">{t('farmInformation', 'Farm information')}</legend>
								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										name="name"
										label={t('myFarm.name')}
										placeholder={t('myFarm.name')}
										value={farm.name}
										onChange={handleChange('farm')}
										disabled={!edit.farm}
										required
										aria-describedby="farm-name-help"
										autoComplete="organization"
									/>
									<div id="farm-name-help" className="sr-only">
										{t('farmNameHelp', 'Enter the name of your farm')}
									</div>

									<TextField
										name="address"
										label={t('myFarm.address')}
										placeholder={t('myFarm.address')}
										value={farm.address}
										onChange={handleChange('farm')}
										disabled={!edit.farm}
										required
										aria-describedby="farm-address-help"
										autoComplete="street-address"
									/>
									<div id="farm-address-help" className="sr-only">
										{t('farmAddressHelp', 'Enter the address of your farm')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<Select
										name="liquidUnit"
										legend={t('myFarm.liquidUnit')}
										defaultLabel={t('myFarm.liquidUnit')}
										value={farm.liquidUnit}
										items={liquidUnit}
										onChange={handleChange('farm')}
										disabled={!edit.farm}
										required
										aria-describedby="liquid-unit-help"
									/>
									<div id="liquid-unit-help" className="sr-only">
										{t('liquidUnitHelp', 'Select the unit for measuring liquids')}
									</div>

									<Select
										name="weightUnit"
										legend={t('myFarm.weightUnit')}
										defaultLabel={t('myFarm.weightUnit')}
										value={farm.weightUnit}
										items={weightUnit}
										onChange={handleChange('farm')}
										disabled={!edit.farm}
										required
										aria-describedby="weight-unit-help"
									/>
									<div id="weight-unit-help" className="sr-only">
										{t('weightUnitHelp', 'Select the unit for measuring weight')}
									</div>

									<Select
										name="temperatureUnit"
										legend={t('myFarm.temperatureUnit')}
										defaultLabel={t('myFarm.temperatureUnit')}
										value={farm.temperatureUnit}
										items={temperatureUnit}
										onChange={handleChange('farm')}
										disabled={!edit.farm}
										required
										aria-describedby="temperature-unit-help"
									/>
									<div id="temperature-unit-help" className="sr-only">
										{t('temperatureUnitHelp', 'Select the unit for measuring temperature')}
									</div>
								</div>
							</fieldset>

							<Button type="submit" disabled={!edit.farm} aria-describedby="save-farm-help">
								{t('myFarm.edit')}
							</Button>
							<div id="save-farm-help" className="sr-only">
								{t('saveFarmHelp', 'Save changes to your farm information')}
							</div>
						</form>
					</div>
				</section>
			)}

			{(user.role === 'admin' || user.role === 'owner') && (
				<section className="flex flex-col p-4" aria-labelledby="billing-heading">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<header className="flex items-center gap-4">
							<h2 id="billing-heading" className="text-xl font-bold">
								{t('myBillingCard.title')}
							</h2>
							<ActionButton
								title={t('editBilling', 'Edit billing')}
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('billingCard')}
								aria-label={
									edit.billingCard
										? t('cancelEditBilling', 'Cancel editing billing')
										: t('editBilling', 'Edit billing')
								}
								aria-pressed={edit.billingCard}
							/>
						</header>

						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={handleSubmitBillingCard}
							autoComplete="off"
							aria-labelledby="billing-heading"
							noValidate
						>
							<fieldset className="border-0 p-0 m-0">
								<legend className="sr-only">
									{t('billingInformation', 'Billing information')}
								</legend>

								<div className="flex flex-row gap-4 w-full items-center">
									<p className="text-lg">{t('myBillingCard.subtitle')}</p>
									<label className="label flex items-center gap-2">
										<input
											name="status"
											type="checkbox"
											className="checkbox border-error bg-error checked:border-info checked:bg-info"
											defaultChecked={billingCard.status}
											onChange={handleChange('billingCard')}
											disabled={!edit.billingCard}
											aria-describedby="billing-status-help"
										/>
										<span>
											{t(billingCard.status ? 'myBillingCard.active' : 'myBillingCard.inactive')}
										</span>
									</label>
									<div id="billing-status-help" className="sr-only">
										{t('billingStatusHelp', 'Toggle to activate or deactivate billing card')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										name="id"
										label={t('myBillingCard.id')}
										placeholder={t('myBillingCard.id')}
										value={billingCard.id}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-id-help"
									/>
									<div id="billing-id-help" className="sr-only">
										{t('billingIdHelp', 'Enter billing identification number')}
									</div>

									<TextField
										name="name"
										label={t('myBillingCard.name')}
										placeholder={t('myBillingCard.name')}
										value={billingCard.name}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-name-help"
										autoComplete="name"
									/>
									<div id="billing-name-help" className="sr-only">
										{t('billingNameHelp', 'Enter name for billing')}
									</div>

									<TextField
										name="email"
										label={t('myBillingCard.email')}
										placeholder={t('myBillingCard.email')}
										value={billingCard.email}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-email-help"
										autoComplete="email"
										type="email"
									/>
									<div id="billing-email-help" className="sr-only">
										{t('billingEmailHelp', 'Enter email for billing')}
									</div>
								</div>

								<div className="grid grid-cols-3 items-center gap-4 w-full">
									<TextField
										name="phone"
										label={t('myBillingCard.phone')}
										placeholder={t('myBillingCard.phone')}
										value={billingCard.phone}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-phone-help"
										autoComplete="tel"
										type="tel"
									/>
									<div id="billing-phone-help" className="sr-only">
										{t('billingPhoneHelp', 'Enter phone number for billing')}
									</div>

									<TextField
										name="address"
										label={t('myBillingCard.address')}
										placeholder={t('myBillingCard.address')}
										value={billingCard.address}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
										required
										aria-describedby="billing-address-help"
										autoComplete="billing street-address"
									/>
									<div id="billing-address-help" className="sr-only">
										{t('billingAddressHelp', 'Enter billing address')}
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
								{t('saveBillingHelp', 'Save changes to your billing information')}
							</div>
						</form>
					</div>
				</section>
			)}
		</div>
	)
}

const INITIAL_USER_DATA: User = {
	uuid: '',
	name: '',
	lastName: '',
	email: '',
	phone: '',
	status: true,
	role: 'employee',
	photoUrl: '',
	language: 'spa',
	farmUuid: '',
}

const INITIAL_BILLING_CARD: BillingCard = {
	uuid: '',
	id: '',
	name: '',
	phone: '',
	email: '',
	address: '',
	status: false,
}

const INITIAL_FARM_DATA: Farm = {
	uuid: '',
	billingCardUuid: '',
	name: '',
	address: '',
	liquidUnit: 'L',
	weightUnit: 'Kg',
	temperatureUnit: '°C',
	status: true,
}

const INITIAL_EDIT = {
	user: false,
	farm: false,
	billingCard: false,
}

export default memo(MyAccount)
