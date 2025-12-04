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
import { FCMTokenManager } from '@/components/notifications/FCMTokenManager'
import { NotificationManager } from '@/components/notifications/NotificationManager'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt.component'
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt.component'

import { useTheme } from '@/hooks/system/useTheme'

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
const TaxDetails = lazy(() => import('@/pages/TaxDetails/TaxDetails.page'))
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
const Calendar = lazy(() => import('@/pages/Calendar/Calendar.page'))
const Voice = lazy(() => import('@/pages/Voice/Voice.page'))

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

	//biome-ignore lint: use only once
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

			if (user.role !== 'admin') {
				await useFarmStore.getState().loadFarmData(user.farmUuid, user.role)
			}

			setAuthLoading(false)
		})

		return () => unsubscribe()
	}, [])

	useEffect(() => {
		i18n.changeLanguage(user?.language || browserLanguage)
	}, [user, i18n, browserLanguage])

	useEffect(() => {
		initializeSEO()
	}, [])

	return (
		<div className="flex flex-col w-full h-screen relative overflow-hidden">
			{/* Global Animated Background Blobs */}
			{location.pathname !== AppRoutes.LOGIN && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none bg-white dark:bg-slate-900 transition-colors duration-300">
					<div
						className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-50 animate-blob transition-colors duration-1000 ${location.pathname.includes(AppRoutes.ANIMALS)
								? 'bg-blue-500/30'
								: location.pathname.includes(AppRoutes.TASKS)
									? 'bg-green-500/30'
									: location.pathname.includes(AppRoutes.MY_SPECIES)
										? 'bg-indigo-500/30'
										: location.pathname.includes(AppRoutes.EMPLOYEES)
											? 'bg-orange-500/30'
											: location.pathname.includes(AppRoutes.TAX_DETAILS)
												? 'bg-indigo-500/30'
												: location.pathname.includes(AppRoutes.MY_ACCOUNT)
													? 'bg-gray-500/30'
													: location.pathname.includes(AppRoutes.DASHBOARD)
														? 'bg-cyan-500/30'
														: location.pathname.includes(AppRoutes.CALENDAR)
															? 'bg-purple-500/30'
															: location.pathname.includes(AppRoutes.VOICE)
																? 'bg-pink-500/30'
																: 'bg-blue-500/30'
							}`}
					/>
					<div
						className={`absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-50 animate-blob animation-delay-2000 transition-colors duration-1000 ${location.pathname.includes(AppRoutes.ANIMALS)
								? 'bg-cyan-500/30'
								: location.pathname.includes(AppRoutes.TASKS)
									? 'bg-emerald-500/30'
									: location.pathname.includes(AppRoutes.MY_SPECIES)
										? 'bg-violet-500/30'
										: location.pathname.includes(AppRoutes.EMPLOYEES)
											? 'bg-amber-500/30'
											: location.pathname.includes(AppRoutes.TAX_DETAILS)
												? 'bg-blue-500/30'
												: location.pathname.includes(AppRoutes.MY_ACCOUNT)
													? 'bg-slate-500/30'
													: location.pathname.includes(AppRoutes.DASHBOARD)
														? 'bg-sky-500/30'
														: location.pathname.includes(AppRoutes.CALENDAR)
															? 'bg-fuchsia-500/30'
															: location.pathname.includes(AppRoutes.VOICE)
																? 'bg-rose-500/30'
																: 'bg-purple-500/30'
							}`}
					/>
					<div
						className={`absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-50 animate-blob animation-delay-4000 transition-colors duration-1000 ${location.pathname.includes(AppRoutes.ANIMALS)
								? 'bg-indigo-500/30'
								: location.pathname.includes(AppRoutes.TASKS)
									? 'bg-teal-500/30'
									: location.pathname.includes(AppRoutes.MY_SPECIES)
										? 'bg-blue-500/30'
										: location.pathname.includes(AppRoutes.EMPLOYEES)
											? 'bg-red-500/30'
											: location.pathname.includes(AppRoutes.TAX_DETAILS)
												? 'bg-purple-500/30'
												: location.pathname.includes(AppRoutes.MY_ACCOUNT)
													? 'bg-zinc-500/30'
													: location.pathname.includes(AppRoutes.DASHBOARD)
														? 'bg-teal-500/30'
														: location.pathname.includes(AppRoutes.CALENDAR)
															? 'bg-indigo-500/30'
															: location.pathname.includes(AppRoutes.VOICE)
																? 'bg-purple-500/30'
																: 'bg-indigo-500/30'
							}`}
					/>
				</div>
			)}

			<SEO />
			<DevelopmentBanner />
			{location.pathname !== AppRoutes.LOGIN && <Navbar />}
			<div className="flex flex-row w-full h-full overflow-hidden relative z-10">
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
							<Route
								path={AppRoutes.EMPLOYEES}
								element={
									<PrivateRoute requiredRoles={['owner', 'admin']}>
										<Employees />
									</PrivateRoute>
								}
							/>
							<Route
								path={AppRoutes.ADD_EMPLOYEE}
								element={
									<PrivateRoute requiredRoles={['owner', 'admin']}>
										<EmployeeForm />
									</PrivateRoute>
								}
							/>
							<Route
								path={AppRoutes.EDIT_EMPLOYEE}
								element={
									<PrivateRoute requiredRoles={['owner', 'admin']}>
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
								path={AppRoutes.CALENDAR}
								element={
									<PrivateRoute>
										<Calendar />
									</PrivateRoute>
								}
							/>

							<Route
								path={AppRoutes.TAX_DETAILS}
								element={
									<PrivateRoute requiredRoles={['owner', 'admin']}>
										<TaxDetails />
									</PrivateRoute>
								}
							/>

							<Route
								path={AppRoutes.VOICE}
								element={
									<PrivateRoute>
										<Voice />
									</PrivateRoute>
								}
							/>
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
					<ToastManager />
					<OfflineIndicator />
					<PWAUpdatePrompt />
					<PWAInstallPrompt />
					<FCMTokenManager />
					<NotificationManager />
					<NotificationToast />
				</main>
			</div>
		</div>
	)
}
