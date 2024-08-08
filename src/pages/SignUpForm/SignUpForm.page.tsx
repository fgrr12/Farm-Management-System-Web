import { useState, type ChangeEvent, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { UserService } from '@/services/user'

import type { SingUpUser } from './SignUpForm.types'

import * as S from './SignUpForm.styles'

export const SignUpForm: FC = () => {
	const [user, setUser] = useState(USER_INITIAL_STATE)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setUser((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const { email, password, name } = user
		await UserService.registerUser({ email, password }, name)
	}

	const handleGoogleLogin = async () => {
		await UserService.loginWithGoogle()
	}

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
