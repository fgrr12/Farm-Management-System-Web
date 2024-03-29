import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppRoutes } from './config/constants/routes'

// Pages
import { Home } from './pages/Home'

// Styles
import { AppContainer } from './styles/root'

export const App: FC = () => {
	return (
		<AppContainer className="app">
			<BrowserRouter>
				<Routes>
					<Route path={AppRoutes.DASHBOARD} element={<Home />} />
				</Routes>
			</BrowserRouter>
		</AppContainer>
	)
}
