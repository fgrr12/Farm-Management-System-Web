import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'
import { auth } from './config/environment'
import { useAppStore } from './store/useAppStore'
import { useUserStore } from './store/useUserStore'

import { Animal } from './pages/Animal'
import { AnimalForm } from './pages/AnimalForm'
import { Animals } from './pages/Animals'
import { BillingCard } from './pages/BillingCard'
import { HealthRecordForm } from './pages/HealthRecordForm'
import { LoginForm } from './pages/LoginForm'
import { ProductionRecordForm } from './pages/ProductionRecordForm'
import { RelatedAnimalsForm } from './pages/RelatedAnimalsForm'
import { SignUpForm } from './pages/SignUpForm'

import { Loading } from './components/layout/Loading'
import { Modal } from './components/layout/Modal'
import { PageHeader } from './components/ui/PageHeader'
import { Sidebar } from './components/ui/Sidebar'

import { UserService } from './services/user'

import { Employees } from './pages/Employees'
import { AppContainer, AppContent } from './styles/root'

export const App: FC = () => {
	const { user, setUser } = useUserStore()
	const { loading: appLoading, defaultModalData: modalData } = useAppStore()
	const { i18n } = useTranslation()

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		i18n.changeLanguage(navigator.language === 'en' ? 'eng' : 'spa')
		onAuthStateChanged(auth, async (authUser) => {
			if (!authUser) {
				setUser(null)
				return
			}
			const user = await UserService.getUser(authUser!.uid)
			i18n.changeLanguage(user?.language || 'spa')
			setUser({
				email: user!.email,
				name: user!.name,
				photoUrl: user!.photoUrl,
				uuid: user!.uuid,
				language: user!.language,
			})
		})
	}, [setUser])
	return (
		<AppContainer className="app">
			{user && <PageHeader />}
			<AppContent>
				{user && <Sidebar />}
				<Routes>
					<Route path="/" element={<Navigate to={AppRoutes.ANIMALS} />} />

					<Route path={AppRoutes.LOGIN} element={<LoginForm />} />
					<Route path={AppRoutes.REGISTER} element={<SignUpForm />} />
					<Route path={AppRoutes.CHANGE_PASSWORD} element={<Animals />} />

					<Route path={AppRoutes.ANIMALS} element={<Animals />} />
					<Route path={AppRoutes.ANIMAL} element={<Animal />} />
					<Route path={AppRoutes.ADD_ANIMAL} element={<AnimalForm />} />
					<Route path={AppRoutes.EDIT_ANIMAL} element={<AnimalForm />} />
					<Route path={AppRoutes.ADD_HEALTH_RECORD} element={<HealthRecordForm />} />
					<Route path={AppRoutes.EDIT_HEALTH_RECORD} element={<HealthRecordForm />} />
					<Route path={AppRoutes.ADD_PRODUCTION_RECORD} element={<ProductionRecordForm />} />
					<Route path={AppRoutes.EDIT_PRODUCTION_RECORD} element={<ProductionRecordForm />} />
					<Route path={AppRoutes.RELATED_ANIMALS} element={<RelatedAnimalsForm />} />

					<Route path={AppRoutes.EMPLOYEES} element={<Employees />} />

					<Route path={AppRoutes.MY_ACCOUNT} element={<div>My Account</div>} />

					<Route path={AppRoutes.BILLING_CARD} element={<BillingCard />} />
				</Routes>

				<Modal
					title={modalData.title}
					message={modalData.message}
					open={modalData.open}
					onAccept={modalData.onAccept}
					onCancel={modalData.onCancel}
				/>
				<Loading open={appLoading} />
			</AppContent>
		</AppContainer>
	)
}
