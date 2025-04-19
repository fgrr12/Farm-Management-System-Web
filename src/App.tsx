import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'
import { auth } from './config/environment'

import { Animal } from './pages/Animal'
import { AnimalForm } from './pages/AnimalForm'
import { Animals } from './pages/Animals'
import { BusinessCard } from './pages/BusinessCard'
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
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'

import { FarmsService } from './services/farms'
import { UserService } from './services/user'
import { useAppStore } from './store/useAppStore'
import { useFarmStore } from './store/useFarmStore'
import { useUserStore } from './store/useUserStore'
import { PrivateRoute } from './utils/PrivateRoute'

export const App: FC = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
	const { loading: appLoading, defaultModalData: modalData, setLoading } = useAppStore()
	const { i18n } = useTranslation()
	const location = useLocation()
	const browserLanguage = navigator.language === 'en' ? 'eng' : 'spa'

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setLoading(true)
		onAuthStateChanged(auth, async (authUser) => {
			if (!authUser) {
				setUser(null)
				setFarm(null)
				return
			}
			const user = await UserService.getUser(authUser!.uid)
			const farm = await FarmsService.getFarm(user!.farmUuid)
			setUser(user)
			setFarm(farm)
		})
		setLoading(false)
	}, [setUser])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		i18n.changeLanguage(user?.language || browserLanguage)
	}, [user])

	return (
		<div className="app flex flex-col w-full h-full">
			{location.pathname !== AppRoutes.LOGIN && <Navbar />}
			<div className="flex flex-row w-full h-full">
				{location.pathname !== AppRoutes.LOGIN && <Sidebar />}
				<Routes>
					<Route path="/" element={<Navigate to={AppRoutes.ANIMALS} />} key="home" />

					<Route path={AppRoutes.LOGIN} element={<LoginForm />} />
					<Route
						path={AppRoutes.CHANGE_PASSWORD}
						element={
							<PrivateRoute>
								<Animals />
							</PrivateRoute>
						}
					/>

					<Route
						path={AppRoutes.ANIMALS}
						element={
							<PrivateRoute>
								<Animals />
							</PrivateRoute>
						}
					/>
					<Route path={AppRoutes.ANIMAL} element={<Animal />} />
					<Route
						path={AppRoutes.ADD_ANIMAL}
						element={
							<PrivateRoute>
								<AnimalForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.EDIT_ANIMAL}
						element={
							<PrivateRoute>
								<AnimalForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.ADD_HEALTH_RECORD}
						element={
							<PrivateRoute>
								<HealthRecordForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.EDIT_HEALTH_RECORD}
						element={
							<PrivateRoute>
								<HealthRecordForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.ADD_PRODUCTION_RECORD}
						element={
							<PrivateRoute>
								<ProductionRecordForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.EDIT_PRODUCTION_RECORD}
						element={
							<PrivateRoute>
								<ProductionRecordForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.RELATED_ANIMALS}
						element={
							<PrivateRoute>
								<RelatedAnimalsForm />
							</PrivateRoute>
						}
					/>

					<Route
						path={AppRoutes.EMPLOYEES}
						element={
							<PrivateRoute>
								<Employees />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.ADD_EMPLOYEE}
						element={
							<PrivateRoute>
								<EmployeeForm />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.EDIT_EMPLOYEE}
						element={
							<PrivateRoute>
								<EmployeeForm />
							</PrivateRoute>
						}
					/>

					<Route
						path={AppRoutes.MY_ACCOUNT}
						element={
							<PrivateRoute>
								<MyAccount />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.MY_SPECIES}
						element={
							<PrivateRoute>
								<MySpecies />
							</PrivateRoute>
						}
					/>

					<Route
						path={AppRoutes.TASKS}
						element={
							<PrivateRoute>
								<Tasks />
							</PrivateRoute>
						}
					/>
					<Route
						path={AppRoutes.ADD_TASK}
						element={
							<PrivateRoute>
								<TaskForm />
							</PrivateRoute>
						}
					/>

					<Route
						path={AppRoutes.BUSINESS_CARD}
						element={
							<PrivateRoute>
								<BusinessCard />
							</PrivateRoute>
						}
					/>
				</Routes>

				<Modal
					title={modalData.title}
					message={modalData.message}
					open={modalData.open}
					onAccept={modalData.onAccept}
					onCancel={modalData.onCancel}
				/>
				<Loading open={appLoading} />
			</div>
		</div>
	)
}
