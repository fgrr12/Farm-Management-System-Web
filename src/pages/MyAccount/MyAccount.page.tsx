import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { FarmsService } from '@/services/farms'
import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { FarmData } from './MyAccount.types'

import * as S from './MyAccount.styles'

export const MyAccount: FC = () => {
	const { user: currentUser, setUser: updateUser } = useUserStore()
	const { farm: currentFarm, setFarm: updateFarm } = useFarmStore()
	const { defaultModalData, setHeaderTitle, setModalData, setLoading } = useAppStore()
	const { t } = useTranslation(['myAccount'])

	const [user, setUser] = useState<User>(INITIAL_USER_DATA)
	const [farm, setFarm] = useState<FarmData>(INITIAL_FARM_DATA)
	const [edit, setEdit] = useState(INITIAL_EDIT)

	const languages = [
		{ value: 'spa', name: t('myProfile.languageList.spa') },
		{ value: 'eng', name: t('myProfile.languageList.eng') },
	]

	const species = [
		{ value: 'Cow', name: 'Cow' },
		{ value: 'Sheep', name: 'Sheep' },
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

	const handleEdit = (key: 'farm' | 'user') => () => {
		setEdit((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	const handleTextChange = (isUser?: boolean) => (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target

		if (isUser) {
			setUser((prev) => ({ ...prev, [name]: value }))
		} else {
			setFarm((prev) => ({ ...prev, [name]: value }))
		}
	}

	const handleSelectChange = (isUser?: boolean) => (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		if (isUser) {
			setUser((prev) => ({ ...prev, [name]: value }))
		} else {
			setFarm((prev) => ({ ...prev, [name]: value }))
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
		} catch (error) {
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
			const species = farm.species.split(',')
			await FarmsService.updateFarm({ ...farm, species })
			updateFarm({ ...farm, species })
			setEdit((prev) => ({ ...prev, farm: false }))
			setModalData({
				open: true,
				title: t('myFarm.modal.editMyFarm.title'),
				message: t('myFarm.modal.editMyFarm.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} catch (error) {
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: useEffect is only called once
	useEffect(() => {
		if (!user || !currentFarm) return

		const species = currentFarm!.species.join(',') || ''
		setUser(currentUser!)
		setFarm({ ...currentFarm!, species })
	}, [currentUser, currentFarm])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
	return (
		<S.MyAccount>
			<S.MyAccountBody>
				<S.MyAccountBodyContent>
					<S.MyAccountBodyTitle>
						{t('myProfile.title')}
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('user')}
						/>
					</S.MyAccountBodyTitle>
					<S.MyAccountBodySubtitle>{t('myProfile.subtitle')}</S.MyAccountBodySubtitle>
					<S.Form onSubmit={handleSubmitUser} autoComplete="off">
						<S.ContainerOf3>
							<TextField
								name="name"
								label={t('myProfile.name')}
								placeholder={t('myProfile.name')}
								value={user!.name}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="lastName"
								label={t('myProfile.lastName')}
								placeholder={t('myProfile.lastName')}
								value={user!.lastName}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="email"
								label={t('myProfile.email')}
								placeholder={t('myProfile.email')}
								value={user!.email}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
						</S.ContainerOf3>
						<S.ContainerOf3>
							<TextField
								name="phone"
								label={t('myProfile.phone')}
								placeholder={t('myProfile.phone')}
								value={user!.phone}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<Select
								name="language"
								label={t('myProfile.language')}
								value={user!.language}
								items={languages}
								onChange={handleSelectChange(true)}
								disabled={!edit.user}
								required
							/>
						</S.ContainerOf3>
						<Button type="submit" disabled={!edit.user}>
							{t('myProfile.edit')}
						</Button>
					</S.Form>
				</S.MyAccountBodyContent>
			</S.MyAccountBody>
			{(user.role === 'admin' || user.role === 'owner') && (
				<S.MyAccountBody>
					<S.MyAccountBodyContent>
						<S.MyAccountBodyTitle>
							{t('myFarm.title')}
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEdit('farm')}
							/>
						</S.MyAccountBodyTitle>
						<S.MyAccountBodySubtitle>{t('myFarm.subtitle')}</S.MyAccountBodySubtitle>
						<S.Form onSubmit={handleSubmitFarm} autoComplete="off">
							<S.ContainerOf3>
								<TextField
									name="name"
									label={t('myFarm.name')}
									placeholder={t('myFarm.name')}
									value={farm!.name}
									onChange={handleTextChange()}
									disabled={!edit.farm}
									required
								/>
								<TextField
									name="address"
									label={t('myFarm.address')}
									placeholder={t('myFarm.address')}
									value={farm!.address}
									onChange={handleTextChange()}
									disabled={!edit.farm}
									required
								/>
								{/* <Select
									name="species"
									label={t('myFarm.species')}
									value={farm!.species}
									onChange={handleSelectChange()}
									disabled={!edit.farm}
									multiple={true}
									required
								>
									<option value="Cow">Cow</option>
									<option value="Sheep">Sheep</option>
								</Select> */}
							</S.ContainerOf3>
							<S.ContainerOf3>
								<Select
									name="liquidUnit"
									label={t('myFarm.liquidUnit')}
									value={farm!.liquidUnit}
									items={liquidUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								/>
								<Select
									name="weightUnit"
									label={t('myFarm.weightUnit')}
									value={farm!.weightUnit}
									items={weightUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								/>
								<Select
									name="temperatureUnit"
									label={t('myFarm.temperatureUnit')}
									value={farm!.temperatureUnit}
									items={temperatureUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								/>
							</S.ContainerOf3>
							<Button type="submit" disabled={!edit.farm}>
								{t('myFarm.edit')}
							</Button>
						</S.Form>
					</S.MyAccountBodyContent>
				</S.MyAccountBody>
			)}
		</S.MyAccount>
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

const INITIAL_FARM_DATA: FarmData = {
	uuid: '',
	name: '',
	address: '',
	species: '',
	liquidUnit: 'L',
	weightUnit: 'Kg',
	temperatureUnit: '°C',
}

const INITIAL_EDIT = {
	user: false,
	farm: false,
}
