import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	children: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
}

/**
 * Last line of defence: a render error anywhere below this point would otherwise
 * unmount the whole tree and leave the user on a blank page with no way back.
 *
 * Deliberately does not use hooks or i18n — it has to keep working when the rest
 * of the app is broken, including before translations have loaded.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false }

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Unhandled render error:', error, errorInfo)
	}

	render() {
		if (!this.state.hasError) return this.props.children

		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-900">
				<i className="i-material-symbols-error-outline w-12! h-12! text-red-500" />
				<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
					Algo salió mal / Something went wrong
				</h1>
				<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
					Recarga la página para continuar. / Reload the page to continue.
				</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
				>
					Recargar / Reload
				</button>
			</div>
		)
	}
}
