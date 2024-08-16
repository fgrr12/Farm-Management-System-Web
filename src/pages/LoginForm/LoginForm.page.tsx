import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PasswordField, TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type { LoginCredentials } from './LoginForm.types'

import * as S from './LoginForm.styles'

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
		<S.Container>
			<S.Card onSubmit={handleSubmit}>
				<S.Title>{t('title')}</S.Title>
				<S.Form onSubmit={handleSubmit}>
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
					<S.ForgotPassword to={AppRoutes.LOGIN}>{t('forgotPassword')}</S.ForgotPassword>
					<Button type="submit">{t('login')}</Button>
				</S.Form>
				<S.Or>{t('or')}</S.Or>
				<S.GoogleButton onClick={handleGoogleLogin}>
					<i className="i-logos-google-icon" />
					{t('google')}
				</S.GoogleButton>
			</S.Card>
		</S.Container>
	)
}

const INITIAL_CREDENTIALS: LoginCredentials = {
	email: '',
	password: '',
}
