import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import { UserService } from '@/services/user'

import { Button } from '@/components/ui/Button'
import { PasswordField, TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

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

	const handleSubmit = useCallback(async (e: FormEvent) => {
		e.preventDefault()

		await withLoadingAndError(
			async () => {
				const { email, password } = credentials
				await UserService.loginWithEmailAndPassword(email, password)
				navigate(AppRoutes.ANIMALS)
			},
			t('toast.errorLoggingIn')
		)
	}, [credentials, withLoadingAndError, t, navigate])

	const handleGoogleLogin = useCallback(async () => {
		await withLoadingAndError(
			async () => {
				await UserService.loginWithGoogle()
				navigate(AppRoutes.ANIMALS)
			},
			t('toast.errorLoggingIn')
		)
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
			<div className="flex flex-col items-center gap-4 max-w-[400px] w-full p-4 sm:border-2 rounded-2xl">
				<h2 className="text-center text-2xl font-bold">{t('title')}</h2>
				<form
					className="flex flex-col items-center gap-4 max-w-[400px] w-full"
					onSubmit={handleSubmit}
				>
					<TextField
						name="email"
						type="email"
						placeholder={t('email')}
						label={t('email')}
						onChange={handleTextChange}
						required
					/>
					<PasswordField
						name="password"
						placeholder={t('password')}
						label={t('password')}
						onChange={handleTextChange}
						required
					/>
					<Link to={AppRoutes.LOGIN}>{t('forgotPassword')}</Link>
					<Button type="submit">{t('login')}</Button>
				</form>
				<div className="divider" />
				<button
					type="button"
					className="btn bg-white text-black border-[#e5e5e5] w-full"
					onClick={handleGoogleLogin}
				>
					<i className="i-logos-google-icon" />
					{t('google')}
				</button>
			</div>
		</div>
	)
}

const INITIAL_CREDENTIALS: LoginCredentials = {
	email: '',
	password: '',
}

export default memo(LoginForm)
