import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'
import { useAppStore } from './store/useAppStore'

import { AddAnimal } from './pages/AddAnimal'
import { AddHealthRecord } from './pages/AddHealthRecord'
import { AddProductionRecord } from './pages/AddProductionRecord'
import { AddRelatedAnimals } from './pages/AddRelatedAnimals'
import { Animal } from './pages/Animal'
import { Animals } from './pages/Animals'
import { BillingCard } from './pages/BillingCard'

import { Loading } from './components/layout/Loading'
import { Modal } from './components/layout/Modal'

import { AppContainer } from './styles/root'

export const App: FC = () => {
	const { loading: appLoading, defaultModalData: modalData } = useAppStore()

	return (
		<AppContainer className="app">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to={AppRoutes.ANIMALS} />} />
					<Route path={AppRoutes.ANIMALS} element={<Animals />} />
					<Route path={AppRoutes.ANIMAL} element={<Animal />} />
					<Route path={AppRoutes.ADD_ANIMAL} element={<AddAnimal />} />
					<Route path={AppRoutes.ADD_HEALTH_RECORD} element={<AddHealthRecord />} />
					<Route path={AppRoutes.ADD_PRODUCTION_RECORD} element={<AddProductionRecord />} />
					<Route path={AppRoutes.ADD_RELATED_ANIMALS} element={<AddRelatedAnimals />} />
					<Route path={AppRoutes.BILLING_CARD} element={<BillingCard />} />

					<Route path={AppRoutes.LOGIN} element={<Animals />} />
					<Route path={AppRoutes.REGISTER} element={<Animals />} />
					<Route path={AppRoutes.CHANGE_PASSWORD} element={<Animals />} />
				</Routes>
			</BrowserRouter>
			<Modal
				title={modalData.title}
				message={modalData.message}
				open={modalData.open}
				onAccept={modalData.onAccept}
				onCancel={modalData.onCancel}
			/>
			<Loading open={appLoading} />
		</AppContainer>
	)
}
