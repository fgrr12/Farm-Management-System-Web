import { AppRoutes } from '@/config/constants/routes'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { UserService } from '@/services/user'

import * as S from './LoginForm.styles'

export const LoginForm: FC = () => {
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const form = e.target as HTMLFormElement
		const email = form.email.value
		const password = form.password.value
		await UserService.loginWithEmailAndPassword(email, password)
	}

	const handleGoogleLogin = async () => {
		await UserService.loginWithGoogle()
	}

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit}>
				<S.Title>Login</S.Title>
				<span>
					New user? <S.ForgotPassword to={AppRoutes.REGISTER}>Create an account</S.ForgotPassword>
				</span>

				<TextField type="email" placeholder="Email" label="Email" />
				<TextField type="text" placeholder="Password" label="Password" />
				<S.ForgotPassword to={AppRoutes.REGISTER}>Forgot your password?</S.ForgotPassword>
				<Button type="submit">Login</Button>
				<S.Or>Or</S.Or>
				<Button onClick={handleGoogleLogin}>Login with Google</Button>
			</S.Form>
		</S.Container>
	)
}
