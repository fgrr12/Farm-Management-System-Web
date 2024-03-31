import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'

// Pages
import { Animal } from './pages/Animal'
import { Animals } from './pages/Animals'

// Styles
import { AddAnimal } from './pages/AddAnimal'
import { AppContainer } from './styles/root'

export const App: FC = () => {
	return (
		<AppContainer className="app">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to={AppRoutes.ANIMALS} />} />
					<Route path={AppRoutes.ANIMALS} element={<Animals />} />
					<Route path={AppRoutes.ANIMAL} element={<Animal />} />
					<Route path={AppRoutes.ADD_ANIMAL} element={<AddAnimal />} />

					<Route path={AppRoutes.LOGIN} element={<Animals />} />
					<Route path={AppRoutes.REGISTER} element={<Animals />} />
					<Route path={AppRoutes.CHANGE_PASSWORD} element={<Animals />} />
				</Routes>
			</BrowserRouter>
		</AppContainer>
	)
}
