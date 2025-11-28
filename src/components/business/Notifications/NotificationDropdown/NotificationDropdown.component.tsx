import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { NotificationSettings } from '@/components/notifications/NotificationSettings'

import { useNotifications } from '@/hooks/notifications/useNotifications'

dayjs.extend(relativeTime)

export const NotificationDropdown = memo(() => {
	const { t } = useTranslation(['notifications'])
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [showSettings, setShowSettings] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const {
		notifications,
		loading,
		unreadCount,
		markAsRead,
		markAllAsRead,
		markAsDismissed,
		getNotificationsByCategory,
	} = useNotifications()

	// Filtrar notificaciones por categoría seleccionada
	const filteredNotifications = getNotificationsByCategory(selectedCategory)

	// Cerrar dropdown al hacer click fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const getNotificationIcon = (type: NotificationData['type']) => {
		switch (type) {
			case 'success':
				return 'i-material-symbols-check-circle bg-green-600! dark:bg-green-400!'
			case 'warning':
				return 'i-material-symbols-warning bg-yellow-600! dark:bg-yellow-400!'
			case 'error':
				return 'i-material-symbols-error bg-red-600! dark:bg-red-400!'
			default:
				return 'i-material-symbols-info bg-blue-600! dark:bg-blue-400!'
		}
	}

	const getNotificationBackground = (type: NotificationData['type'], read: boolean) => {
		const baseOpacity = read ? '5' : '10'
		const borderOpacity = read ? '200' : '300'

		switch (type) {
			case 'success':
				return `bg-green-${baseOpacity} border-l-green-${borderOpacity} dark:bg-green-900/${baseOpacity} dark:border-l-green-${borderOpacity}`
			case 'warning':
				return `bg-yellow-${baseOpacity} border-l-yellow-${borderOpacity} dark:bg-yellow-900/${baseOpacity} dark:border-l-yellow-${borderOpacity}`
			case 'error':
				return `bg-red-${baseOpacity} border-l-red-${borderOpacity} dark:bg-red-900/${baseOpacity} dark:border-l-red-${borderOpacity}`
			default:
				return `bg-blue-${baseOpacity} border-l-blue-${borderOpacity} dark:bg-blue-900/${baseOpacity} dark:border-l-blue-${borderOpacity}`
		}
	}

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'medication':
				return 'i-material-symbols-medication text-blue-600'
			case 'health':
				return 'i-material-symbols-health-and-safety text-green-600'
			case 'task':
				return 'i-material-symbols-task text-purple-600'
			case 'production':
				return 'i-material-symbols-analytics text-orange-600'
			default:
				return 'i-material-symbols-notifications text-gray-600'
		}
	}

	const handleNotificationClick = async (notification: NotificationData) => {
		// Marcar como leída automáticamente al hacer hover/click
		if (!notification.read) {
			await markAsRead(notification.uuid)
		}

		// Aquí puedes agregar lógica para navegar según el tipo de notificación
		if (notification.animalUuid) {
			navigate(`${AppRoutes.ANIMALS}/${notification.animalUuid}`)
		} else if (notification.category === 'task') {
			navigate(AppRoutes.TASKS)
		}

		setIsOpen(false)
	}

	const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
		e.stopPropagation()
		await markAsRead(notificationId)
	}

	const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
		e.stopPropagation()
		await markAsDismissed(notificationId)
	}

	const categories = [
		{ key: 'all', label: t('categories.all'), count: notifications.length },
		{
			key: 'medication',
			label: t('categories.medication'),
			count: notifications.filter((n) => n.category === 'medication').length,
		},
		{
			key: 'health',
			label: t('categories.health'),
			count: notifications.filter((n) => n.category === 'health').length,
		},
		{
			key: 'task',
			label: t('categories.task'),
			count: notifications.filter((n) => n.category === 'task').length,
		},
		{
			key: 'production',
			label: t('categories.production'),
			count: notifications.filter((n) => n.category === 'production').length,
		},
	]

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Trigger Button */}
			<button
				type="button"
				className="btn btn-ghost btn-circle hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
				aria-label={t('title')}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="relative">
					<i className="i-material-symbols-notifications-outline-sharp w-5! h-5! bg-gray-600! dark:bg-gray-300!" />
					{unreadCount > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</div>
			</button>

			{/* Dropdown Content */}
			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-[420px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[85vh] flex flex-col">
					{/* Header */}
					<div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									{t('title')}
								</h3>
								{/* Settings Button */}
								<button
									type="button"
									onClick={() => setShowSettings(true)}
									className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
									title={t('settings')}
								>
									<i className="i-material-symbols-settings w-4! h-4!" />
								</button>
							</div>
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={markAllAsRead}
									className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
								>
									{t('markAllRead')}
								</button>
							)}
						</div>

						{/* Category Tabs */}
						<div className="relative overflow-hidden">
							<div
								className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto scrollbar-none scroll-smooth"
								style={{
									scrollbarWidth: 'none',
									msOverflowStyle: 'none',
								}}
							>
								{categories.map((category) => (
									<button
										key={category.key}
										type="button"
										onClick={() => setSelectedCategory(category.key)}
										className={`
											flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0
											${
												selectedCategory === category.key
													? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
													: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
											}
										`}
									>
										<i className={`w-3! h-3! ${getCategoryIcon(category.key)}`} />
										<span>{category.label}</span>
										{category.count > 0 && (
											<span
												className={`
													px-1.5 py-0.5 rounded-full text-xs font-medium
													${
														selectedCategory === category.key
															? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
															: 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
													}
												`}
											>
												{category.count}
											</span>
										)}
									</button>
								))}
							</div>

							{/* Subtle scroll indicator */}
							<div className="absolute right-0 top-0 bottom-0 w-3 bg-linear-to-l from-gray-100 dark:from-gray-700 to-transparent pointer-events-none opacity-60" />
						</div>
					</div>

					{/* Notifications List */}
					<div className="flex-1 overflow-y-auto">
						{loading ? (
							<div className="p-4">
								<div className="animate-pulse space-y-3">
									{Array.from({ length: 4 }).map((_, i) => (
										<div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
									))}
								</div>
							</div>
						) : filteredNotifications.length === 0 ? (
							<div className="p-8 text-center">
								<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="i-material-symbols-notifications-off w-8! h-8! text-gray-400" />
								</div>
								<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
									{selectedCategory === 'all'
										? t('noNotifications')
										: t('noNotificationsInCategory')}
								</h4>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									{t('notificationsWillAppearHere')}
								</p>
							</div>
						) : (
							<div className="p-3 space-y-4">
								{filteredNotifications.map((notification) => (
									<div
										key={notification.uuid}
										role="button"
										tabIndex={0}
										className={`
											group relative p-5 rounded-lg border-l-4 transition-all duration-200 cursor-pointer shadow-sm
											hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]
											${getNotificationBackground(notification.type, notification.read)}
											${!notification.read ? 'shadow-md ring-1 ring-black/5 dark:ring-white/10' : 'shadow-sm'}
										`}
										onClick={() => handleNotificationClick(notification)}
										onMouseEnter={() => {
											if (!notification.read) {
												markAsRead(notification.uuid)
											}
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault()
												handleNotificationClick(notification)
											}
										}}
									>
										<div className="flex items-start gap-3">
											{/* Icon */}
											<div className="shrink-0">
												<div
													className={`
													w-10 h-10 rounded-full flex items-center justify-center
													${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : ''}
													${notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
													${notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : ''}
													${notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
												`}
												>
													<i className={`w-5! h-5! ${getNotificationIcon(notification.type)}`} />
												</div>
											</div>

											{/* Content */}
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-3">
													<h4
														className={`text-sm font-semibold ${
															notification.type === 'success'
																? 'text-green-800 dark:text-green-200'
																: notification.type === 'warning'
																	? 'text-yellow-800 dark:text-yellow-200'
																	: notification.type === 'error'
																		? 'text-red-800 dark:text-red-200'
																		: 'text-blue-800 dark:text-blue-200'
														}`}
													>
														{notification.title}
													</h4>
													{!notification.read && (
														<div
															className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
																notification.type === 'success'
																	? 'bg-green-500'
																	: notification.type === 'warning'
																		? 'bg-yellow-500'
																		: notification.type === 'error'
																			? 'bg-red-500'
																			: 'bg-blue-500'
															}`}
														/>
													)}
												</div>

												<p
													className={`text-sm leading-relaxed ${
														notification.type === 'success'
															? 'text-green-700 dark:text-green-300'
															: notification.type === 'warning'
																? 'text-yellow-700 dark:text-yellow-300'
																: notification.type === 'error'
																	? 'text-red-700 dark:text-red-300'
																	: 'text-blue-700 dark:text-blue-300'
													}`}
												>
													{notification.message}
												</p>

												<div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
													<div className="flex items-center gap-2">
														<span
															className={`text-xs font-medium ${
																notification.type === 'success'
																	? 'text-green-600 dark:text-green-400'
																	: notification.type === 'warning'
																		? 'text-yellow-600 dark:text-yellow-400'
																		: notification.type === 'error'
																			? 'text-red-600 dark:text-red-400'
																			: 'text-blue-600 dark:text-blue-400'
															}`}
														>
															{dayjs(notification.createdAt).fromNow()}
														</span>
														<span
															className={`text-xs px-2 py-0.5 rounded-full font-medium ${
																notification.type === 'success'
																	? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
																	: notification.type === 'warning'
																		? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
																		: notification.type === 'error'
																			? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
																			: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
															}`}
														>
															{t(`categories.${notification.category}`)}
														</span>
													</div>

													<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														{!notification.read && (
															<button
																type="button"
																onClick={(e) => handleMarkAsRead(e, notification.uuid)}
																className={`p-1.5 rounded-md transition-colors ${
																	notification.type === 'success'
																		? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
																		: notification.type === 'warning'
																			? 'text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
																			: notification.type === 'error'
																				? 'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30'
																				: 'text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30'
																}`}
																title={t('markAsRead')}
															>
																<i className="i-material-symbols-mark-email-read w-3! h-3!" />
															</button>
														)}
														<button
															type="button"
															onClick={(e) => handleDismiss(e, notification.uuid)}
															className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
															title={t('dismiss')}
														>
															<i className="i-material-symbols-close w-3! h-3!" />
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Settings Modal */}
			{showSettings && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center">
					<button
						type="button"
						className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default"
						onClick={() => setShowSettings(false)}
						aria-label="Close settings"
					/>
					<div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									{t('notificationSettings')}
								</h3>
								<button
									type="button"
									onClick={() => setShowSettings(false)}
									className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
								>
									<i className="i-material-symbols-close w-4! h-4!" />
								</button>
							</div>
						</div>
						<div className="p-4">
							<NotificationSettings />
						</div>
					</div>
				</div>
			)}
		</div>
	)
})
