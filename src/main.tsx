import ReactDOM from 'react-dom/client'
import { App } from './App'

import '@/index.css'
import { BrowserRouter } from 'react-router-dom'
import 'virtual:uno.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
)
