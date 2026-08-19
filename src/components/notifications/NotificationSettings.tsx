import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

import { useFCMToken } from '@/hooks/notifications/useFCMToken'

export const NotificationSettings = () => {
	const { t } = useTranslation(['notifications'])
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
					<h3 className="card-title text-warning">{t('settingsPanel.unsupportedTitle')}</h3>
					<p className="text-base-content/70">{t('settingsPanel.unsupportedMessage')}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="card bg-base-100 shadow-md">
			<div className="card-body">
				<h3 className="card-title">{t('notificationSettings')}</h3>

				<div className="space-y-4">
					{/* Permission Status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">{t('settingsPanel.permissionStatus')}</p>
							<p className="text-sm text-base-content/70">
								{hasPermission
									? t('settingsPanel.permissionGranted')
									: t('settingsPanel.permissionDenied')}
							</p>
						</div>
						<div className={`badge ${hasPermission ? 'badge-success' : 'badge-warning'}`}>
							{hasPermission ? t('settingsPanel.active') : t('settingsPanel.inactive')}
						</div>
					</div>

					{/* Token Status */}
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">{t('settingsPanel.deviceRegistered')}</p>
							<p className="text-sm text-base-content/70">
								{isTokenRegistered
									? t('settingsPanel.deviceRegisteredYes')
									: t('settingsPanel.deviceRegisteredNo')}
							</p>
						</div>
						<div className={`badge ${isTokenRegistered ? 'badge-success' : 'badge-error'}`}>
							{isTokenRegistered ? t('settingsPanel.registered') : t('settingsPanel.notRegistered')}
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
								<title>{t('settingsPanel.errorIcon')}</title>
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
								{t('settingsPanel.enable')}
							</Button>
						)}

						{hasPermission && isTokenRegistered && (
							<Button
								variant="danger"
								onClick={removeDeviceToken}
								loading={loading}
								disabled={loading}
							>
								{t('settingsPanel.disableOnDevice')}
							</Button>
						)}
					</div>

					{/* Information */}
					<div className="text-sm text-base-content/70 bg-base-200 p-3 rounded-lg">
						<p className="font-medium mb-2">{t('settingsPanel.infoTitle')}</p>
						<ul className="list-disc list-inside space-y-1">
							<li>{t('settingsPanel.infoKeepsYouInformed')}</li>
							<li>{t('settingsPanel.infoIncludes')}</li>
							<li>{t('settingsPanel.infoCanDisable')}</li>
							<li>{t('settingsPanel.infoPerDevice')}</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
