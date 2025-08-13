import { useFCMToken } from '@/hooks/notifications/useFCMToken'

export const FCMStatus = () => {
	const { hasPermission, isSupported, isTokenRegistered, token, error } = useFCMToken()

	if (!isSupported) {
		return (
			<div className="alert alert-warning">
				<span>❌ FCM no soportado en este navegador</span>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			<div className="alert alert-info">
				<span>✅ FCM soportado</span>
			</div>

			<div className={`alert ${hasPermission ? 'alert-success' : 'alert-warning'}`}>
				<span>{hasPermission ? '✅ Permisos concedidos' : '⚠️ Permisos no concedidos'}</span>
			</div>

			<div className={`alert ${isTokenRegistered ? 'alert-success' : 'alert-error'}`}>
				<span>{isTokenRegistered ? '✅ Token registrado' : '❌ Token no registrado'}</span>
			</div>

			{error && (
				<div className="alert alert-error">
					<span>❌ Error: {error}</span>
				</div>
			)}

			{token && (
				<details className="collapse bg-base-200">
					<summary className="collapse-title">Ver Token FCM</summary>
					<div className="collapse-content">
						<code className="text-xs break-all">{token}</code>
					</div>
				</details>
			)}
		</div>
	)
}
