import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useUserStore } from '@/store/useUserStore'

import type { SingUpUser } from './SignUpForm.types'

import * as S from './SignUpForm.styles'

export const SignUpForm: FC = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const [userInfo, setUserInfo] = useState(USER_INITIAL_STATE)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setUserInfo((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const { email, password, name } = userInfo
		await UserService.registerUser({ email, password }, name)
		navigate(AppRoutes.ANIMALS)
	}

	const handleGoogleLogin = async () => {
		await UserService.loginWithGoogle()
	}

	useEffect(() => {
		if (user) {
			navigate(AppRoutes.ANIMALS)
		}
	}, [user, navigate])
	return (
		<S.Container>
			<S.Card>
				<S.Title>Sign Up</S.Title>
				<S.Form onSubmit={handleSubmit}>
					<TextField
						name="name"
						type="text"
						placeholder="Name"
						label="Name"
						onChange={handleTextChange}
						required
					/>
					<TextField
						name="email"
						type="email"
						placeholder="Email"
						label="Email"
						onChange={handleTextChange}
						required
					/>
					<TextField
						name="password"
						type="text"
						placeholder="Password"
						label="Password"
						onChange={handleTextChange}
						required
					/>
					<Button type="submit">Sign Up</Button>
				</S.Form>
				<S.Or>Or</S.Or>
				<Button onClick={handleGoogleLogin}>Sign up with Google</Button>
			</S.Card>
		</S.Container>
	)
}

const USER_INITIAL_STATE: SingUpUser = {
	email: '',
	password: '',
	name: '',
}
