import { AppRoutes } from '@/config/constants/routes'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './MyAccount.styles'

export const MyAccount: FC = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	// biome-ignore lint/correctness/useExhaustiveDependencies: useEffect is only called once
	useEffect(() => {
		setHeaderTitle('My Account')
		console.log('user', user, 'farm', farm)

		if (!user) {
			navigate(AppRoutes.LOGIN)
			return
		}
	}, [])
	return (
		user && (
			<S.MyAccount>
				<S.MyAccountBody>
					<S.MyAccountBodyContent>
						<S.MyAccountBodyTitle>
							My Account
							<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
						</S.MyAccountBodyTitle>
						<S.MyAccountBodySubtitle>Manage your account settings</S.MyAccountBodySubtitle>
						<S.Form autoComplete="off">
							<S.ContainerOf3>
								<TextField label="Name" value={user!.name} disabled required />
								<TextField label="Last Name" value={user!.lastName} disabled required />
								<TextField label="Email" value={user!.email} disabled required />
							</S.ContainerOf3>
							<S.ContainerOf3>
								<TextField label="Phone" value={user!.phone} disabled required />
								<Select
									name="language"
									label="Language"
									value={user!.language}
									// onChange={handleSelectChange}
									disabled
									required
								>
									<option value="spa">Spanish</option>
									<option value="eng">English</option>
								</Select>
							</S.ContainerOf3>
							<Button type="submit">Update My Account</Button>
						</S.Form>
					</S.MyAccountBodyContent>
				</S.MyAccountBody>
				<S.MyAccountBody>
					<S.MyAccountBodyContent>
						<S.MyAccountBodyTitle>
							My Farm
							<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
						</S.MyAccountBodyTitle>
						<S.MyAccountBodySubtitle>Manage your farm settings</S.MyAccountBodySubtitle>
						<S.Form autoComplete="off">
							<S.ContainerOf3>
								<TextField label="Name" value={farm!.name} disabled required />
								<TextField label="address" value={farm!.address} disabled required />
							</S.ContainerOf3>
							<S.ContainerOf3>
								<TextField label="Species" value={farm!.species} disabled required />
								<Select
									name="measureLiquid"
									label="Measure Liquid"
									value={farm!.measureLiquid}
									// onChange={handleSelectChange}
									disabled
									required
								>
									<option value="liters">Liters</option>
									<option value="gallons">Gallons</option>
								</Select>
								<Select
									name="measureSolid"
									label="Measure Solid"
									value={farm!.measureSolid}
									// onChange={handleSelectChange}
									disabled
									required
								>
									<option value="kilograms">Kilograms</option>
									<option value="pounds">Pounds</option>
								</Select>
							</S.ContainerOf3>
							<Button type="submit">Update My Farm</Button>
						</S.Form>
					</S.MyAccountBodyContent>
				</S.MyAccountBody>
			</S.MyAccount>
		)
	)
}
