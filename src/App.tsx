import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom'
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
import { MySpecies } from './pages/MySpecies'
import { ProductionRecordForm } from './pages/ProductionRecordForm'
import { RelatedAnimalsForm } from './pages/RelatedAnimalsForm'
import { TaskForm } from './pages/TaskForm'
import { Tasks } from './pages/Tasks'

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
	const {
		loading: appLoading,
		defaultModalData: modalData,
		topHeaderHeight,
		setLoading,
	} = useAppStore()
	const { i18n } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const match = useMatch(AppRoutes.ANIMAL)

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		onAuthStateChanged(auth, async (authUser) => {
			setLoading(true)
			if (!authUser) {
				setUser(null)
				setFarm(null)
				setLoading(false)
				if (match?.pattern.path !== AppRoutes.ANIMAL) {
					navigate(AppRoutes.LOGIN)
				}
				return
			}
			const user = await UserService.getUser(authUser!.uid)
			const farm = await FarmsService.getFarm(user!.farmUuid)
			i18n.changeLanguage(user?.language || 'spa')
			setUser(user)
			setFarm(farm)
			setLoading(false)
		})
	}, [setUser])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (!user?.language) i18n.changeLanguage(navigator.language === 'en' ? 'eng' : 'spa')
	}, [navigator])

	return (
		<AppContainer className="app">
			{location.pathname !== AppRoutes.LOGIN && <PageHeader />}
			<AppContent $topHeaderHeight={topHeaderHeight}>
				{location.pathname !== AppRoutes.LOGIN && <Sidebar />}
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

					<Route path={AppRoutes.EMPLOYEES} element={<Employees />} />
					<Route path={AppRoutes.ADD_EMPLOYEE} element={<EmployeeForm />} />
					<Route path={AppRoutes.EDIT_EMPLOYEE} element={<EmployeeForm />} />

					<Route path={AppRoutes.MY_ACCOUNT} element={<MyAccount />} />
					<Route path={AppRoutes.MY_SPECIES} element={<MySpecies />} />

					<Route path={AppRoutes.TASKS} element={<Tasks />} />
					<Route path={AppRoutes.ADD_TASK} element={<TaskForm />} />

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
