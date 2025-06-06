import { GoogleReCaptchaProvider } from '@google-recaptcha/react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'

import '@/index.css'
import 'virtual:uno.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<GoogleReCaptchaProvider isEnterprise type='v3' siteKey={import.meta.env.CAPTCHA_KEY}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</GoogleReCaptchaProvider>
)
