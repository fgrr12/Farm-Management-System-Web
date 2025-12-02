import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'

import '@/index.css'
import 'virtual:uno.css'
import './i18n'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60, // 1 hour
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
})

ReactDOM.createRoot(document.getElementById('root')!).render(
	<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
)
