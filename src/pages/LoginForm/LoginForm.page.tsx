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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
			<a
				href="#login-form"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToLogin')}
			</a>

			{/* Background Pattern */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
			</div>

			<section
				className="relative bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 p-8 w-full max-w-md"
				aria-labelledby="login-heading"
			>
				{/* Logo/Brand Section */}
				<header className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<i className="i-healthicons-animal-cow w-8! h-8! bg-white!" aria-hidden="true" />
					</div>
					<h1 id="login-heading" className="text-3xl font-bold text-gray-900 mb-2">
						{t('title')}
					</h1>
					<p className="text-gray-600 text-sm">
						{t('subtitle')}
					</p>
				</header>

				<form
					id="login-form"
					className="space-y-6"
					onSubmit={handleSubmit}
					aria-labelledby="login-heading"
					noValidate
				>
					<div className="space-y-4">
						<TextField
							name="email"
							type="email"
							placeholder={t('email')}
							label={t('email')}
							onChange={handleTextChange}
							required
							aria-describedby="email-help"
							autoComplete="email"
							leftIcon="i-material-symbols-mail-outline"
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
					</div>

					<div className="flex items-center justify-between">
						<label className="flex items-center">
							<input
								type="checkbox"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<span className="ml-2 text-sm text-gray-600">{t('rememberMe')}</span>
						</label>
						<Link
							to={AppRoutes.LOGIN}
							className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
							aria-label={t('accessibility.forgotPasswordLink')}
						>
							{t('forgotPassword')}
						</Link>
					</div>

					<Button
						type="submit"
						className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
						aria-describedby="login-button-help"
					>
						<span className="flex items-center justify-center gap-2">
							<i className="i-material-symbols-login w-5! h-5! bg-white!" aria-hidden="true" />
							{t('login')}
						</span>
					</Button>
					<div id="login-button-help" className="sr-only">
						{t('accessibility.loginButtonHelp')}
					</div>
				</form>

				{/* Divider */}
				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
					</div>
				</div>

				{/* Google Login */}
				<button
					type="button"
					className="w-full h-12 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 group"
					onClick={handleGoogleLogin}
					aria-describedby="google-login-help"
				>
					<i className="i-logos-google-icon w-5! h-5!" aria-hidden="true" />
					<span className="group-hover:text-gray-900 transition-colors duration-200">
						{t('google')}
					</span>
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
