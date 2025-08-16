import {
	type ChangeEvent,
	type FormEvent,
	memo,
	useCallback,
	useEffect,
	useId,
	useState,
} from 'react'
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
	const baseId = useId()
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
			<a
				href={`#${baseId}-login-form`}
				id={`${baseId}-skip-link`}
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
				className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/20 dark:border-gray-700/20 p-8 w-full max-w-md"
				aria-labelledby={`${baseId}-login-heading`}
			>
				{/* Logo/Brand Section */}
				<header className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<i className="i-healthicons-animal-cow w-8! h-8! bg-white!" aria-hidden="true" />
					</div>
					<h1
						id={`${baseId}-login-heading`}
						className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
					>
						{t('title')}
					</h1>
					<p className="text-gray-600 dark:text-gray-300 text-sm">{t('subtitle')}</p>
				</header>

				<form
					id={`${baseId}-login-form`}
					className="space-y-6"
					onSubmit={handleSubmit}
					aria-labelledby={`${baseId}-login-heading`}
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
							aria-describedby={`${baseId}-email-help`}
							autoComplete="email"
							leftIcon="i-material-symbols-mail-outline"
						/>
						<div id={`${baseId}-email-help`} className="sr-only">
							{t('accessibility.emailHelp')}
						</div>

						<PasswordField
							name="password"
							placeholder={t('password')}
							label={t('password')}
							onChange={handleTextChange}
							required
							aria-describedby={`${baseId}-password-help`}
							autoComplete="current-password"
						/>
						<div id={`${baseId}-password-help`} className="sr-only">
							{t('accessibility.passwordHelp')}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<label className="flex items-center">
							<input
								type="checkbox"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
								{t('rememberMe')}
							</span>
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
					<div id={`${baseId}-login-button-help`} className="sr-only">
						{t('accessibility.loginButtonHelp')}
					</div>
				</form>

				{/* Divider */}
				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300 dark:border-gray-600" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
							{t('orContinueWith')}
						</span>
					</div>
				</div>

				{/* Google Login */}
				<button
					type="button"
					className="w-full h-12 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 group"
					onClick={handleGoogleLogin}
					aria-describedby="google-login-help"
				>
					<i className="i-logos-google-icon w-5! h-5!" aria-hidden="true" />
					<span className="group-hover:text-gray-900 transition-colors duration-200">
						{t('google')}
					</span>
				</button>
				<div id={`${baseId}-google-login-help`} className="sr-only">
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
