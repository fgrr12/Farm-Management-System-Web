import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useUserStore } from '@/store/useUserStore'

import type { LoginCredentials } from './LoginForm.types'

import * as S from './LoginForm.styles'

export const LoginForm: FC = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setCredentials((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const { email, password } = credentials
		await UserService.loginWithEmailAndPassword(email, password)
		navigate(AppRoutes.ANIMALS)
	}

	const handleGoogleLogin = async () => {
		await UserService.loginWithGoogle()
		navigate(AppRoutes.ANIMALS)
	}

	useEffect(() => {
		if (user) {
			navigate(AppRoutes.ANIMALS)
		}
	}, [user, navigate])

	return (
		<S.Container>
			<S.Card onSubmit={handleSubmit}>
				<S.Title>Login</S.Title>
				<span>
					New user? <S.ForgotPassword to={AppRoutes.REGISTER}>Create an account</S.ForgotPassword>
				</span>
				<S.Form onSubmit={handleSubmit}>
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
					<S.ForgotPassword to={AppRoutes.REGISTER}>Forgot your password?</S.ForgotPassword>
					<Button type="submit">Login</Button>
				</S.Form>
				<S.Or>Or</S.Or>
				<Button onClick={handleGoogleLogin}>Login with Google</Button>
			</S.Card>
		</S.Container>
	)
}

const INITIAL_CREDENTIALS: LoginCredentials = {
	email: '',
	password: '',
}
