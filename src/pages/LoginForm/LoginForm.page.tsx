import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PasswordField, TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type { LoginCredentials } from './LoginForm.types'

export const LoginForm: FC = () => {
	const { user } = useUserStore()
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS)
	const { t } = useTranslation(['loginForm'])

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setCredentials((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			const { email, password } = credentials
			await UserService.loginWithEmailAndPassword(email, password)
			navigate(AppRoutes.ANIMALS)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorLoggingIn.title'),
				message: t('modal.errorLoggingIn.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		try {
			setLoading(true)
			await UserService.loginWithGoogle()
			navigate(AppRoutes.ANIMALS)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorLoggingIn.title'),
				message: t('modal.errorLoggingIn.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
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
