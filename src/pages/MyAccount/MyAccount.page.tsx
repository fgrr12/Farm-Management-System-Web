import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
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

const MyAccount = () => {
	const { user: currentUser, setUser: updateUser } = useUserStore()
	const {
		billingCard: currentBillingCard,
		farm: currentFarm,
		setFarm: updateFarm,
		setBillingCard: updateBillingCard,
	} = useFarmStore()
	const { setHeaderTitle, setLoading, setToastData } = useAppStore()
	const { t } = useTranslation(['myAccount'])

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

	const handleEdit = (key: 'farm' | 'user' | 'billingCard') => () => {
		setEdit((prev) => ({ ...prev, [key]: !prev[key] }))
	}

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

	const handleSubmitUser = async (e: FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			await UserService.updateUser(user)
			updateUser(user)
			setEdit((prev) => ({ ...prev, user: false }))
			setToastData({
				message: t('myProfile.toast.edited'),
				type: 'success',
			})
		} catch (_error) {
			setToastData({
				message: t('myProfile.toast.errorEditing'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitFarm = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			await FarmsService.updateFarm({ ...farm })
			updateFarm({ ...farm })
			setEdit((prev) => ({ ...prev, farm: false }))
			setToastData({
				message: t('myFarm.toast.edited'),
				type: 'success',
			})
		} catch (_error) {
			setToastData({
				message: t('myFarm.toast.errorEditing'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitBillingCard = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			const uuid = billingCard.uuid ?? crypto.randomUUID()
			if (billingCard.uuid) {
				await BillingCardsService.updateBillingCard(billingCard)
				updateFarm({ ...farm })
				setToastData({
					message: t('myBillingCard.toast.edited'),
					type: 'success',
				})
			} else {
				farm.billingCardUuid = uuid
				billingCard.uuid = uuid
				await BillingCardsService.setBillingCard(billingCard)
				await FarmsService.updateFarm({ ...farm })
				setToastData({
					message: t('myBillingCard.toast.added'),
					type: 'success',
				})
			}
			updateBillingCard(billingCard)
			setEdit((prev) => ({ ...prev, billingCard: false }))
		} catch (_error) {
			setToastData({
				message: t('myBillingCard.toast.errorEditing'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint:: useEffect is only called once
	useEffect(() => {
		if (!user || !currentFarm) return

		setUser(currentUser!)
		setFarm({ ...currentFarm! })
		setBillingCard({ ...currentBillingCard! })
	}, [currentUser, currentFarm])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
	return (
		<div className="flex flex-col w-full h-full">
			<div className="flex flex-col p-4">
				<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
					<h2 className="flex items-center gap-4 text-xl font-bold">
						{t('myProfile.title')}
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('user')}
						/>
					</h2>
					<p className="text-lg">{t('myProfile.subtitle')}</p>
					<form
						className="flex flex-col gap-4 w-full"
						onSubmit={handleSubmitUser}
						autoComplete="off"
					>
						<div className="grid grid-cols-3 items-center gap-4 w-full">
							<TextField
								name="name"
								label={t('myProfile.name')}
								placeholder={t('myProfile.name')}
								value={user.name}
								onChange={handleChange('user')}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="lastName"
								label={t('myProfile.lastName')}
								placeholder={t('myProfile.lastName')}
								value={user.lastName}
								onChange={handleChange('user')}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="email"
								label={t('myProfile.email')}
								placeholder={t('myProfile.email')}
								value={user.email}
								onChange={handleChange('user')}
								disabled={!edit.user}
								required
							/>
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
							/>
							<Select
								name="language"
								legend={t('myProfile.selectLanguage')}
								defaultLabel={t('myProfile.selectLanguage')}
								value={user.language}
								items={languages}
								onChange={handleChange('user')}
								disabled={!edit.user}
								required
							/>
						</div>
						<Button type="submit" disabled={!edit.user}>
							{t('myProfile.edit')}
						</Button>
					</form>
				</div>
			</div>
			{(user.role === 'admin' || user.role === 'owner') && (
				<div className="flex flex-col p-4">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<h2 className="flex items-center gap-4 text-xl font-bold">
							{t('myFarm.title')}
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('farm')}
							/>
						</h2>
						<p className="text-lg">{t('myFarm.subtitle')}</p>
						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={handleSubmitFarm}
							autoComplete="off"
						>
							<div className="grid grid-cols-3 items-center gap-4 w-full">
								<TextField
									name="name"
									label={t('myFarm.name')}
									placeholder={t('myFarm.name')}
									value={farm.name}
									onChange={handleChange('farm')}
									disabled={!edit.farm}
									required
								/>
								<TextField
									name="address"
									label={t('myFarm.address')}
									placeholder={t('myFarm.address')}
									value={farm.address}
									onChange={handleChange('farm')}
									disabled={!edit.farm}
									required
								/>
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
								/>
								<Select
									name="weightUnit"
									legend={t('myFarm.weightUnit')}
									defaultLabel={t('myFarm.weightUnit')}
									value={farm.weightUnit}
									items={weightUnit}
									onChange={handleChange('farm')}
									disabled={!edit.farm}
									required
								/>
								<Select
									name="temperatureUnit"
									legend={t('myFarm.temperatureUnit')}
									defaultLabel={t('myFarm.temperatureUnit')}
									value={farm.temperatureUnit}
									items={temperatureUnit}
									onChange={handleChange('farm')}
									disabled={!edit.farm}
									required
								/>
							</div>
							<Button type="submit" disabled={!edit.farm}>
								{t('myFarm.edit')}
							</Button>
						</form>
					</div>
				</div>
			)}
			{(user.role === 'admin' || user.role === 'owner') && (
				<div className="flex flex-col p-4">
					<div className="flex flex-col p-4 gap-4 border-2 rounded-xl border-gray-200">
						<h2 className="flex items-center gap-4 text-xl font-bold">
							{t('myBillingCard.title')}
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('billingCard')}
							/>
						</h2>

						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={handleSubmitBillingCard}
							autoComplete="off"
						>
							<div className="flex flex-row gap-4 w-full">
								<p className="text-lg">{t('myBillingCard.subtitle')}</p>
								<label className="label">
									<input
										name="status"
										type="checkbox"
										className="checkbox border-error bg-error checked:border-info checked:bg-info"
										defaultChecked={billingCard.status}
										onChange={handleChange('billingCard')}
										disabled={!edit.billingCard}
									/>
									{t(billingCard.status ? 'myBillingCard.active' : 'myBillingCard.inactive')}
								</label>
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
								/>
								<TextField
									name="name"
									label={t('myBillingCard.name')}
									placeholder={t('myBillingCard.name')}
									value={billingCard.name}
									onChange={handleChange('billingCard')}
									disabled={!edit.billingCard}
									required
								/>
								<TextField
									name="email"
									label={t('myBillingCard.email')}
									placeholder={t('myBillingCard.email')}
									value={billingCard.email}
									onChange={handleChange('billingCard')}
									disabled={!edit.billingCard}
									required
								/>
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
								/>
								<TextField
									name="address"
									label={t('myBillingCard.address')}
									placeholder={t('myBillingCard.address')}
									value={billingCard.address}
									onChange={handleChange('billingCard')}
									disabled={!edit.billingCard}
									required
								/>
							</div>
							<Button type="submit" disabled={!edit.billingCard}>
								{t('myBillingCard.edit')}
							</Button>
						</form>
					</div>
				</div>
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

export default MyAccount
