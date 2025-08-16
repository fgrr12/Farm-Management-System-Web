import { Button } from '@/components/ui/Button'

import { useFCMToken } from '@/hooks/notifications/useFCMToken'

export const NotificationSettings = () => {
	const {
		hasPermission,
		isSupported,
		isTokenRegistered,
		loading,
		error,
		requestPermission,
		removeDeviceToken,
	} = useFCMToken()

	if (!isSupported) {
		return (
			<div className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h3 className="card-title text-warning">Notificaciones no soportadas</h3>
					<p className="text-base-content/70">
						Tu navegador no soporta notificaciones push. Para recibir notificaciones, actualiza tu
						navegador o usa un navegador compatible.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="card bg-base-100 shadow-md">
			<div className="card-body">
				<h3 className="card-title">Configuración de Notificaciones</h3>

				<div className="space-y-4">
					{/* Permission Status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Estado de permisos</p>
							<p className="text-sm text-base-content/70">
								{hasPermission ? 'Permisos concedidos' : 'Permisos no concedidos'}
							</p>
						</div>
						<div className={`badge ${hasPermission ? 'badge-success' : 'badge-warning'}`}>
							{hasPermission ? 'Activo' : 'Inactivo'}
						</div>
					</div>

					{/* Token Status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Dispositivo registrado</p>
							<p className="text-sm text-base-content/70">
								{isTokenRegistered
									? 'Tu dispositivo está registrado para recibir notificaciones'
									: 'Tu dispositivo no está registrado'}
							</p>
						</div>
						<div className={`badge ${isTokenRegistered ? 'badge-success' : 'badge-error'}`}>
							{isTokenRegistered ? 'Registrado' : 'No registrado'}
						</div>
					</div>

					{/* Error Display */}
					{error && (
						<div className="alert alert-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<title>Error icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{error}</span>
						</div>
					)}

					{/* Actions */}
					<div className="card-actions justify-end">
						{!hasPermission && (
							<Button
								variant="primary"
								onClick={requestPermission}
								loading={loading}
								disabled={loading}
							>
								Activar Notificaciones
							</Button>
						)}

						{hasPermission && isTokenRegistered && (
							<Button
								variant="danger"
								onClick={removeDeviceToken}
								loading={loading}
								disabled={loading}
							>
								Desactivar en este Dispositivo
							</Button>
						)}
					</div>

					{/* Information */}
					<div className="text-sm text-base-content/70 bg-base-200 p-3 rounded-lg">
						<p className="font-medium mb-2">Información sobre las notificaciones:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>
								Las notificaciones te mantienen informado sobre eventos importantes en tu granja
							</li>
							<li>
								Incluyen alertas de salud animal, recordatorios de medicación y actualizaciones de
								tareas
							</li>
							<li>Puedes desactivar las notificaciones en cualquier momento</li>
							<li>Los permisos de notificación son por dispositivo y navegador</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
