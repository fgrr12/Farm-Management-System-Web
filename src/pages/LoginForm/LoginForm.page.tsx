import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import { UserService } from '@/services/user'

import { Button } from '@/components/ui/Button'
import { PasswordField, TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { LoginCredentials } from './LoginForm.types'

const LoginForm = () => {
	const { user } = useUserStore()
	const { setLoading } = useAppStore()
	const navigate = useNavigate()
	const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS)
	const { t } = useTranslation(['loginForm'])
	const { withLoadingAndError } = usePagePerformance()

	const handleTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setCredentials((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()

			await withLoadingAndError(async () => {
				const { email, password } = credentials
				await UserService.loginWithEmailAndPassword(email, password)
				navigate(AppRoutes.ANIMALS)
			}, t('toast.errorLoggingIn'))
		},
		[credentials, withLoadingAndError, t, navigate]
	)

	const handleGoogleLogin = useCallback(async () => {
		await withLoadingAndError(async () => {
			await UserService.loginWithGoogle()
			navigate(AppRoutes.ANIMALS)
		}, t('toast.errorLoggingIn'))
	}, [withLoadingAndError, t, navigate])

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		setLoading(false)
		if (user) {
			navigate(AppRoutes.ANIMALS)
		}
	}, [user, navigate])

	return (
		<div className="flex flex-col justify-center items-center w-full h-[100dvh] overflow-auto p-5">
			<a
				href="#login-form"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToLogin')}
			</a>

			<section
				className="flex flex-col items-center gap-4 max-w-[400px] w-full p-4 sm:border-2 rounded-2xl"
				aria-labelledby="login-heading"
			>
				<header>
					<h1 id="login-heading" className="text-center text-2xl font-bold">
						{t('title')}
					</h1>
				</header>

				<form
					id="login-form"
					className="flex flex-col items-center gap-4 max-w-[400px] w-full"
					onSubmit={handleSubmit}
					aria-labelledby="login-heading"
					noValidate
				>
					<TextField
						name="email"
						type="email"
						placeholder={t('email')}
						label={t('email')}
						onChange={handleTextChange}
						required
						aria-describedby="email-help"
						autoComplete="email"
					/>
					<div id="email-help" className="sr-only">
						{t('accessibility.emailHelp')}
					</div>

					<PasswordField
						name="password"
						placeholder={t('password')}
						label={t('password')}
						onChange={handleTextChange}
						required
						aria-describedby="password-help"
						autoComplete="current-password"
					/>
					<div id="password-help" className="sr-only">
						{t('accessibility.passwordHelp')}
					</div>

					<Link to={AppRoutes.LOGIN} aria-label={t('accessibility.forgotPasswordLink')}>
						{t('forgotPassword')}
					</Link>

					<Button type="submit" aria-describedby="login-button-help">
						{t('login')}
					</Button>
					<div id="login-button-help" className="sr-only">
						{t('accessibility.loginButtonHelp')}
					</div>
				</form>

				<div className="divider" />

				<button
					type="button"
					className="btn bg-white text-black border-[#e5e5e5] w-full"
					onClick={handleGoogleLogin}
					aria-describedby="google-login-help"
				>
					<i className="i-logos-google-icon" aria-hidden="true" />
					{t('google')}
				</button>
				<div id="google-login-help" className="sr-only">
					{t('accessibility.googleLoginHelp')}
				</div>
			</section>
		</div>
	)
}

const INITIAL_CREDENTIALS: LoginCredentials = {
	email: '',
	password: '',
}

export default memo(LoginForm)
