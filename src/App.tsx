import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'
import { auth } from './config/environment'
import { useAppStore } from './store/useAppStore'
import { useFarmStore } from './store/useFarmStore'
import { useUserStore } from './store/useUserStore'

import { Animal } from './pages/Animal'
import { AnimalForm } from './pages/AnimalForm'
import { Animals } from './pages/Animals'
import { BillingCard } from './pages/BillingCard'
import { EmployeeForm } from './pages/EmployeeForm'
import { Employees } from './pages/Employees'
import { HealthRecordForm } from './pages/HealthRecordForm'
import { LoginForm } from './pages/LoginForm'
import { MyAccount } from './pages/MyAccount'
import { ProductionRecordForm } from './pages/ProductionRecordForm'
import { RelatedAnimalsForm } from './pages/RelatedAnimalsForm'

import { Loading } from './components/layout/Loading'
import { Modal } from './components/layout/Modal'
import { PageHeader } from './components/ui/PageHeader'
import { Sidebar } from './components/ui/Sidebar'

import { FarmsService } from './services/farms'
import { UserService } from './services/user'

import { AppContainer, AppContent } from './styles/root'

export const App: FC = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
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
			const farm = await FarmsService.getFarm(user!.farmUuid)
			i18n.changeLanguage(user?.language || 'spa')
			setUser(user)
			setFarm(farm)
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

					{(user?.role === 'admin' || user?.role === 'owner') && (
						<>
							<Route path={AppRoutes.EMPLOYEES} element={<Employees />} />
							<Route path={AppRoutes.ADD_EMPLOYEE} element={<EmployeeForm />} />
							<Route path={AppRoutes.EDIT_EMPLOYEE} element={<EmployeeForm />} />
						</>
					)}

					<Route path={AppRoutes.MY_ACCOUNT} element={<MyAccount />} />

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
