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
		setHeaderTitle(t('title'))
		if (!user || !currentFarm) return

		const species = currentFarm!.species.join(',') || ''
		setUser(currentUser!)
		setFarm({ ...currentFarm!, species })
	}, [user, currentFarm])
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
								onChange={handleSelectChange(true)}
								disabled={!edit.user}
								required
							>
								<option value="spa">{t('myProfile.languageList.spa')}</option>
								<option value="eng">{t('myProfile.languageList.eng')}</option>
							</Select>
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
								<TextField
									name="species"
									label={t('myFarm.species')}
									placeholder={t('myFarm.species')}
									value={farm!.species}
									onChange={handleTextChange()}
									disabled={!edit.farm}
									required
								/>
							</S.ContainerOf3>
							<S.ContainerOf3>
								<Select
									name="liquidUnit"
									label={t('myFarm.liquidUnit')}
									value={farm!.liquidUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								>
									<option value="L">{t('myFarm.liquidUnitList.L')}</option>
									<option value="Gal">{t('myFarm.liquidUnitList.Gal')}</option>
								</Select>
								<Select
									name="weightUnit"
									label={t('myFarm.weightUnit')}
									value={farm!.weightUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								>
									<option value="Kg">{t('myFarm.weightUnitList.Kg')}</option>
									<option value="Lb">{t('myFarm.weightUnitList.Lb')}</option>
								</Select>
								<Select
									name="temperatureUnit"
									label={t('myFarm.temperatureUnit')}
									value={farm!.temperatureUnit}
									onChange={handleSelectChange(false)}
									disabled={!edit.farm}
									required
								>
									<option value="°C">{t('myFarm.temperatureUnitList.°C')}</option>
									<option value="°F">{t('myFarm.temperatureUnitList.°F')}</option>
								</Select>
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

const INITIAL_USER_DATA: User =
	{
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
	} || null

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
