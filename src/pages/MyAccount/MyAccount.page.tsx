import { AppRoutes } from '@/config/constants/routes'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
	const { setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

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
		await UserService.updateUser(user)
		updateUser(user)
	}

	const handleSubmitFarm = async (e: FormEvent) => {
		e.preventDefault()
		const species = farm.species.split(',')
		await FarmsService.updateFarm({ ...farm, species })
		updateFarm({ ...farm, species })
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: useEffect is only called once
	useEffect(() => {
		setHeaderTitle('My Account')
		if (!user || !currentFarm) {
			navigate(AppRoutes.LOGIN)
			return
		}
		const species = currentFarm!.species.join(',') || ''
		setUser(currentUser!)
		setFarm({ ...currentFarm!, species })
	}, [])
	return (
		<S.MyAccount>
			<S.MyAccountBody>
				<S.MyAccountBodyContent>
					<S.MyAccountBodyTitle>
						My Account
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('user')}
						/>
					</S.MyAccountBodyTitle>
					<S.MyAccountBodySubtitle>Manage your account settings</S.MyAccountBodySubtitle>
					<S.Form onSubmit={handleSubmitUser} autoComplete="off">
						<S.ContainerOf3>
							<TextField
								name="name"
								label="Name"
								value={user!.name}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="lastName"
								label="Last Name"
								value={user!.lastName}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<TextField
								name="email"
								label="Email"
								value={user!.email}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
						</S.ContainerOf3>
						<S.ContainerOf3>
							<TextField
								name="phone"
								label="Phone"
								value={user!.phone}
								onChange={handleTextChange(true)}
								disabled={!edit.user}
								required
							/>
							<Select
								name="language"
								label="Language"
								value={user!.language}
								onChange={handleSelectChange(true)}
								disabled={!edit.user}
								required
							>
								<option value="spa">Spanish</option>
								<option value="eng">English</option>
							</Select>
						</S.ContainerOf3>
						<Button type="submit" disabled={!edit.user}>
							Update My Account
						</Button>
					</S.Form>
				</S.MyAccountBodyContent>
			</S.MyAccountBody>
			<S.MyAccountBody>
				<S.MyAccountBodyContent>
					<S.MyAccountBodyTitle>
						My Farm
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit-square-outline"
							onClick={handleEdit('farm')}
						/>
					</S.MyAccountBodyTitle>
					<S.MyAccountBodySubtitle>Manage your farm settings</S.MyAccountBodySubtitle>
					<S.Form onSubmit={handleSubmitFarm} autoComplete="off">
						<S.ContainerOf3>
							<TextField
								name="name"
								label="Name"
								value={farm!.name}
								onChange={handleTextChange()}
								disabled={!edit.farm}
								required
							/>
							<TextField
								name="address"
								label="address"
								value={farm!.address}
								onChange={handleTextChange()}
								disabled={!edit.farm}
								required
							/>
							<TextField
								name="species"
								label="Species"
								value={farm!.species}
								onChange={handleTextChange()}
								disabled={!edit.farm}
								required
							/>
						</S.ContainerOf3>
						<S.ContainerOf3>
							<Select
								name="liquidUnit"
								label="Measure Liquid"
								value={farm!.liquidUnit}
								onChange={handleSelectChange(false)}
								disabled={!edit.farm}
								required
							>
								<option value="L">Liters</option>
								<option value="Gal">Gallons</option>
							</Select>
							<Select
								name="weightUnit"
								label="Measure Solid"
								value={farm!.weightUnit}
								onChange={handleSelectChange(false)}
								disabled={!edit.farm}
								required
							>
								<option value="Kg">Kilograms</option>
								<option value="Lb">Pounds</option>
							</Select>
							<Select
								name="temperatureUnit"
								label="Measure Temperature"
								value={farm!.temperatureUnit}
								onChange={handleSelectChange(false)}
								disabled={!edit.farm}
								required
							>
								<option value="°C">Celsius</option>
								<option value="°F">Fahrenheit</option>
							</Select>
						</S.ContainerOf3>
						<Button type="submit" disabled={!edit.farm}>
							Update My Farm
						</Button>
					</S.Form>
				</S.MyAccountBodyContent>
			</S.MyAccountBody>
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
