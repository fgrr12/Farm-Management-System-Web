import { useGSAP } from '@gsap/react'
import { onAuthStateChanged } from 'firebase/auth'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/all'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'
import { auth } from '@/config/firebaseConfig'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { PrivateRoute } from '@/utils/PrivateRoute'
import { initializeSEO } from '@/utils/seo'

import { UserService } from '@/services/user'

import { DevelopmentBanner } from '@/components/layout/DevelopmentBanner'
import { Loading } from '@/components/layout/Loading'
import { Modal } from '@/components/layout/Modal'
import { Navbar } from '@/components/layout/Navbar'
import { OfflineIndicator } from '@/components/layout/OfflineIndicator'
import { SEO } from '@/components/layout/SEO'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastManager } from '@/components/layout/ToastManager'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt.component'
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt.component'

import { useTheme } from '@/hooks/system/useTheme'

// import { VoiceRecorder } from './components/layout/VoiceRecorder/VoiceRecorder'
import { usePreloadRoutes } from './hooks/ui/usePreloadRoutes'

gsap.registerPlugin(SplitText, useGSAP)

// Core pages (loaded immediately)
const Animals = lazy(() => import('@/pages/Animals/Animals.page'))
const LoginForm = lazy(() => import('@/pages/LoginForm/LoginForm.page'))

// Secondary pages (preloaded on user interaction)
const Animal = lazy(() =>
	import('@/pages/Animal/Animal.page').then((module) => {
		import('@/pages/AnimalForm/AnimalForm.page')
		import('@/pages/HealthRecordForm/HealthRecordForm.page')
		import('@/pages/ProductionRecordForm/ProductionRecordForm.page')
		return module
	})
)

const AnimalForm = lazy(() => import('@/pages/AnimalForm/AnimalForm.page'))
const BillingCard = lazy(() => import('@/pages/BillingCard/BillingCard.page'))
const EmployeeForm = lazy(() => import('@/pages/EmployeeForm/EmployeeForm.page'))
const Employees = lazy(() =>
	import('@/pages/Employees/Employees.page').then((module) => {
		import('@/pages/EmployeeForm/EmployeeForm.page')
		return module
	})
)
const HealthRecordForm = lazy(() => import('@/pages/HealthRecordForm/HealthRecordForm.page'))
const MyAccount = lazy(() => import('@/pages/MyAccount/MyAccount.page'))
const MySpecies = lazy(() => import('@/pages/MySpecies/MySpecies.page'))
const ProductionRecordForm = lazy(
	() => import('@/pages/ProductionRecordForm/ProductionRecordForm.page')
)
const RelatedAnimalsForm = lazy(() => import('@/pages/RelatedAnimalsForm/RelatedAnimalsForm.page'))
const TaskForm = lazy(() => import('@/pages/TaskForm/TaskForm.page'))
const Tasks = lazy(() =>
	import('@/pages/Tasks/Tasks.page').then((module) => {
		import('@/pages/TaskForm/TaskForm.page')
		return module
	})
)
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard.page'))

export const App = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
	const { loading: appLoading, defaultModalData: modalData } = useAppStore()
	const { i18n } = useTranslation()
	const location = useLocation()
	const [authLoading, setAuthLoading] = useState(true)
	const browserLanguage = navigator.language === 'en' ? 'eng' : 'spa'

	// Initialize theme system
	useTheme()

	usePreloadRoutes()

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		setAuthLoading(true)
		const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
			if (!authUser) {
				setUser(null)
				setFarm(null)
				setAuthLoading(false)
				return
			}

			const user = await UserService.getUser(authUser.uid)
			setUser(user)

			await useFarmStore.getState().loadFarmData(user.farmUuid, user.role)

			setAuthLoading(false)
		})

		return () => unsubscribe()
	}, [])

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		i18n.changeLanguage(user?.language || browserLanguage)
	}, [user])

	useEffect(() => {
		initializeSEO()
	}, [])

	return (
		<div className="flex flex-col w-full h-screen">
			<SEO />
			<DevelopmentBanner />
			{location.pathname !== AppRoutes.LOGIN && <Navbar />}
			<div className="flex flex-row w-full h-full overflow-hidden">
				{location.pathname !== AppRoutes.LOGIN && <Sidebar />}
				<main className="w-full h-full overflow-auto relative">
					<Suspense
						fallback={
							<div className="flex items-center justify-center h-full">
								<div className="loading loading-spinner loading-lg" />
							</div>
						}
					>
						<Routes>
							<Route path="/" element={<Navigate to={AppRoutes.DASHBOARD} />} key="home" />

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
								path={AppRoutes.DASHBOARD}
								element={
									<PrivateRoute>
										<Dashboard />
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
							{user?.role === 'owner' ||
								(user?.role === 'admin' && (
									<Route
										path={AppRoutes.EMPLOYEES}
										element={
											<PrivateRoute>
												<Employees />
											</PrivateRoute>
										}
									/>
								))}
							{user?.role === 'owner' ||
								(user?.role === 'admin' && (
									<Route
										path={AppRoutes.ADD_EMPLOYEE}
										element={
											<PrivateRoute>
												<EmployeeForm />
											</PrivateRoute>
										}
									/>
								))}
							{user?.role === 'owner' ||
								(user?.role === 'admin' && (
									<Route
										path={AppRoutes.EDIT_EMPLOYEE}
										element={
											<PrivateRoute>
												<EmployeeForm />
											</PrivateRoute>
										}
									/>
								))}

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
							{user?.role === 'owner' ||
								(user?.role === 'admin' && (
									<Route
										path={AppRoutes.BILLING_CARD}
										element={
											<PrivateRoute>
												<BillingCard />
											</PrivateRoute>
										}
									/>
								))}
						</Routes>
					</Suspense>

					<Modal
						title={modalData.title}
						message={modalData.message}
						open={modalData.open}
						onAccept={modalData.onAccept}
						onCancel={modalData.onCancel}
					/>
					<Loading open={appLoading || authLoading} />
					{/* {user && <VoiceRecorder />} */}
					<ToastManager />
					<OfflineIndicator />
					<PWAUpdatePrompt />
					<PWAInstallPrompt />
				</main>
			</div>
		</div>
	)
}
