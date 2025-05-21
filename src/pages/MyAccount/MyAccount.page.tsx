import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { FarmsService } from '@/services/farms'
import { UserService } from '@/services/user'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

export const MyAccount: FC = () => {
	const { user: currentUser, setUser: updateUser } = useUserStore()
	const { farm: currentFarm, setFarm: updateFarm } = useFarmStore()
	const { defaultModalData, setHeaderTitle, setModalData, setLoading } = useAppStore()
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
		(key: 'farm' | 'user' | 'billingCard') => (event: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target

			if (key === 'user') {
				setUser((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
			} else if (key === 'farm') {
				setFarm((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
			} else {
				setBillingCard((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
			}
		}

	const handleSelectChange =
		(key: 'farm' | 'user' | 'billingCard') => (event: ChangeEvent<HTMLSelectElement>) => {
			const { name, value } = event.target

			if (key === 'user') {
				setUser((prev) => ({ ...prev, [name]: value }))
			} else if (key === 'farm') {
				setFarm((prev) => ({ ...prev, [name]: value }))
			} else {
				setBillingCard((prev) => ({ ...prev, [name]: value }))
			}
		}

	const handleSubmitUser = async (e: FormEvent) => {
		e.preventDefault()
		try {
			await UserService.updateUser(user)
			updateUser(user)
			setEdit((prev) => ({ ...prev, user: false }))
			setModalData({
				open: true,
				title: t('myProfile.modal.editMyAccount.title'),
				message: t('myProfile.modal.editMyAccount.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} catch (_error) {
			setModalData({
				open: true,
				title: t('myProfile.modal.errorEditingMyAccount.title'),
				message: t('myProfile.modal.errorEditingMyAccount.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitFarm = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			farm.billingCard = billingCard
			await FarmsService.updateFarm({ ...farm })
			updateFarm({ ...farm })
			setEdit((prev) => ({ ...prev, farm: false }))
			setModalData({
				open: true,
				title: t('myFarm.modal.editMyFarm.title'),
				message: t('myFarm.modal.editMyFarm.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} catch (_error) {
			setModalData({
				open: true,
				title: t('myFarm.modal.errorMyFarm.title'),
				message: t('myFarm.modal.errorMyFarm.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitBillingCard = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			farm.billingCard = billingCard
			await FarmsService.updateFarm({ ...farm })
			updateFarm({ ...farm })
			setEdit((prev) => ({ ...prev, billingCard: false }))
			setModalData({
				open: true,
				title: t('myBillingCard.modal.editBillingCard.title'),
				message: t('myBillingCard.modal.editBillingCard.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} catch (_error) {
			setModalData({
				open: true,
				title: t('myBillingCard.modal.errorBillingCard.title'),
				message: t('myBillingCard.modal.errorBillingCard.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
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
		setBillingCard({ ...currentFarm!.billingCard! })
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
								onChange={handleSelectChange('user')}
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
									onChange={handleSelectChange('farm')}
									disabled={!edit.farm}
									required
								/>
								<Select
									name="weightUnit"
									legend={t('myFarm.weightUnit')}
									defaultLabel={t('myFarm.weightUnit')}
									value={farm.weightUnit}
									items={weightUnit}
									onChange={handleSelectChange('farm')}
									disabled={!edit.farm}
									required
								/>
								<Select
									name="temperatureUnit"
									legend={t('myFarm.temperatureUnit')}
									defaultLabel={t('myFarm.temperatureUnit')}
									value={farm.temperatureUnit}
									items={temperatureUnit}
									onChange={handleSelectChange('farm')}
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
						<p className="text-lg">{t('myBillingCard.subtitle')}</p>
						<form
							className="flex flex-col gap-4 w-full"
							onSubmit={handleSubmitBillingCard}
							autoComplete="off"
						>
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
	name: '',
	phone: '',
	id: '',
	email: '',
	address: '',
}

const INITIAL_FARM_DATA: Farm = {
	uuid: '',
	name: '',
	address: '',
	liquidUnit: 'L',
	weightUnit: 'Kg',
	temperatureUnit: '°C',
	billingCard: INITIAL_BILLING_CARD,
	status: true,
}

const INITIAL_EDIT = {
	user: false,
	farm: false,
	billingCard: false,
}
