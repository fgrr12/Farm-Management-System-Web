import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/layout/DatePicker'
import { Modal } from '@/components/layout/Modal'
import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

interface CalendarEventModalProps {
	isOpen: boolean
	onClose: () => void
	event?: CalendarEvent | null
	selectedDate?: dayjs.Dayjs | null
	onSave: (
		eventData:
			| CalendarEvent
			| Omit<CalendarEvent, 'uuid' | 'createdAt' | 'farmUuid' | 'updatedAt' | 'createdBy'>
	) => Promise<void>
	onDelete?: () => Promise<void>
}

export const CalendarEventModal = memo<CalendarEventModalProps>(
	({ isOpen, onClose, event, selectedDate, onSave, onDelete }) => {
		const { t } = useTranslation(['calendar'])
		const [loading, setLoading] = useState(false)
		const [deleteLoading, setDeleteLoading] = useState(false)
		const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
		const [formErrors, setFormErrors] = useState<Record<string, string>>({})
		const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'reminder'>('basic')
		const [formData, setFormData] = useState({
			title: '',
			description: '',
			category: 'task' as CalendarEvent['type'],
			priority: 'medium' as CalendarEvent['priority'],
			date: null as dayjs.Dayjs | null,
			time: '',
			animalId: '',
			completed: false,
			location: '',
			reminder: false,
			reminderMinutes: 15,
			reminderFrequency: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
			notes: '',
			tags: [] as string[],
		})

		// Inicializar formulario
		useEffect(() => {
			if (event) {
				const eventDate = dayjs(event.date)
				setFormData({
					title: event.title,
					description: event.description || '',
					category: event.type,
					priority: event.priority,
					date: eventDate,
					time: event.time ? eventDate.format('HH:mm') : '',
					animalId: event.animalId || '',
					completed: event.status === 'completed',
					location: event.location || '',
					reminder: event.reminder || false,
					reminderMinutes: event.reminderMinutes || 15,
					reminderFrequency: 'once',
					notes: event.notes || '',
					tags: event.tags || [],
				})
			} else if (selectedDate) {
				setFormData((prev) => ({
					...prev,
					date: selectedDate,
					time: dayjs().add(1, 'hour').startOf('hour').format('HH:mm'),
					title: '',
					description: '',
				}))
			}
		}, [event, selectedDate])

		// Limpiar errores cuando se cierra el modal
		useEffect(() => {
			if (!isOpen) {
				setFormErrors({})
				setShowDeleteConfirm(false)
				setActiveTab('basic')
			}
		}, [isOpen])

		const validateForm = useCallback(() => {
			const errors: Record<string, string> = {}

			if (!formData.title.trim()) {
				errors.title = t('form.errors.titleRequired')
			} else if (formData.title.trim().length < 3) {
				errors.title = t('form.errors.titleTooShort')
			}

			if (!formData.date) {
				errors.date = t('form.errors.dateRequired')
			}

			if (
				formData.time &&
				!dayjs(`${formData.date?.format('YYYY-MM-DD')} ${formData.time}`).isValid()
			) {
				errors.time = t('form.errors.invalidTime')
			}

			setFormErrors(errors)
			return Object.keys(errors).length === 0
		}, [formData, t])

		const handleInputChange = useCallback(
			(field: string, value: any) => {
				setFormData((prev) => ({
					...prev,
					[field]: value,
				}))

				// Limpiar error específico cuando el usuario empieza a corregir
				if (formErrors[field]) {
					setFormErrors((prev) => {
						const newErrors = { ...prev }
						delete newErrors[field]
						return newErrors
					})
				}
			},
			[formErrors]
		)

		const handleTagAdd = useCallback(
			(tag: string) => {
				if (tag.trim() && !formData.tags.includes(tag.trim())) {
					handleInputChange('tags', [...formData.tags, tag.trim()])
				}
			},
			[formData.tags, handleInputChange]
		)

		const handleTagRemove = useCallback(
			(tagToRemove: string) => {
				handleInputChange(
					'tags',
					formData.tags.filter((tag) => tag !== tagToRemove)
				)
			},
			[formData.tags, handleInputChange]
		)

		const handleSubmit = useCallback(
			async (e: React.FormEvent) => {
				e.preventDefault()

				if (!validateForm()) {
					// Si hay errores en básico, cambiar a esa pestaña
					if (formErrors.title || formErrors.date) {
						setActiveTab('basic')
					}
					return
				}

				setLoading(true)
				try {
					// Combinar fecha y hora
					const dateTime =
						formData.time && formData.date
							? dayjs(`${formData.date.format('YYYY-MM-DD')} ${formData.time}`)
							: formData.date?.startOf('day') || dayjs().startOf('day')

					const eventData = {
						title: formData.title.trim(),
						description: formData.description.trim(),
						type: formData.category as CalendarEvent['type'],
						priority: formData.priority,
						date: dateTime.toISOString(),
						time: formData.time,
						animalId: formData.animalId.trim() || undefined,
						status: formData.completed ? 'completed' : ('pending' as CalendarEvent['status']),
						location: formData.location.trim() || undefined,
						reminder: formData.reminder,
						reminderMinutes: formData.reminder ? formData.reminderMinutes : undefined,
						notes: formData.notes.trim() || undefined,
						tags: formData.tags.length > 0 ? formData.tags : undefined,
					}

					if (event) {
						await onSave({
							...eventData,
							uuid: event.uuid,
							createdAt: event.createdAt,
						})
					} else {
						await onSave(eventData)
					}
				} catch (error) {
					console.error('Error saving event:', error)
				} finally {
					setLoading(false)
				}
			},
			[formData, event, onSave, validateForm, formErrors]
		)

		const handleDelete = useCallback(async () => {
			if (!onDelete) return

			setDeleteLoading(true)
			try {
				await onDelete()
			} catch (error) {
				console.error('Error deleting event:', error)
			} finally {
				setDeleteLoading(false)
				setShowDeleteConfirm(false)
			}
		}, [onDelete])

		const categoryOptions = [
			{
				value: 'task',
				label: t('categories.task'),
				icon: 'i-heroicons-clipboard-document-list',
				color: 'text-blue-600',
			},
			{
				value: 'medication',
				label: t('categories.medication'),
				icon: 'i-heroicons-beaker',
				color: 'text-red-600',
			},
			{
				value: 'vaccination',
				label: t('categories.health'),
				icon: 'i-heroicons-heart',
				color: 'text-green-600',
			},
			{
				value: 'appointment',
				label: t('categories.breeding'),
				icon: 'i-heroicons-calendar-days',
				color: 'text-purple-600',
			},
			{
				value: 'general',
				label: t('categories.feeding'),
				icon: 'i-heroicons-home',
				color: 'text-orange-600',
			},
		]

		const priorityOptions = [
			{
				value: 'critical',
				label: t('priority.critical'),
				icon: 'i-heroicons-exclamation-triangle',
				color: 'text-red-600',
			},
			{
				value: 'high',
				label: t('priority.high'),
				icon: 'i-heroicons-arrow-up',
				color: 'text-orange-500',
			},
			{
				value: 'medium',
				label: t('priority.medium'),
				icon: 'i-heroicons-minus',
				color: 'text-yellow-500',
			},
			{
				value: 'low',
				label: t('priority.low'),
				icon: 'i-heroicons-arrow-down',
				color: 'text-gray-500',
			},
		]

		const reminderOptions = [
			{ value: 5, label: t('reminder.5min') },
			{ value: 15, label: t('reminder.15min') },
			{ value: 30, label: t('reminder.30min') },
			{ value: 60, label: t('reminder.1hour') },
			{ value: 1440, label: t('reminder.1day') },
		]

		const frequencyOptions = [
			{ value: 'once', label: t('reminder.once') },
			{ value: 'daily', label: t('reminder.daily') },
			{ value: 'weekly', label: t('reminder.weekly') },
			{ value: 'monthly', label: t('reminder.monthly') },
		]

		const selectedCategory = categoryOptions.find((cat) => cat.value === formData.category)

		return (
			<Modal open={isOpen} onClose={onClose} size="lg">
				<div className="flex flex-col h-full max-h-[90vh]">
					{/* Header mejorado con bordes redondeados */}
					<div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-xl">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div
									className={`
									p-3 rounded-xl ${selectedCategory?.color || 'text-gray-600'} 
									bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-600
								`}
								>
									<div className={`${selectedCategory?.icon || 'i-heroicons-calendar'} w-7 h-7`} />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										{event ? t('editEvent') : t('createEvent')}
									</h2>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{formData.date?.format('dddd, MMMM D, YYYY')}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{event && onDelete && (
									<ActionButton
										icon="i-material-symbols-delete-outline"
										onClick={() => setShowDeleteConfirm(true)}
										disabled={loading || deleteLoading}
									/>
								)}
								<ActionButton
									icon="i-heroicons-x-mark"
									onClick={onClose}
									disabled={loading || deleteLoading}
								/>
							</div>
						</div>

						{/* Tabs */}
						<div className="flex space-x-1 mt-5 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
							{[
								{ id: 'basic', label: t('tabs.basic'), icon: 'i-heroicons-document-text' },
								{ id: 'details', label: t('tabs.details'), icon: 'i-heroicons-information-circle' },
								{ id: 'reminder', label: t('tabs.reminder'), icon: 'i-heroicons-bell' },
							].map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id as any)}
									className={`
										flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200
										${
											activeTab === tab.id
												? 'bg-blue-600 text-white shadow-sm'
												: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
										}
									`}
								>
									<div className={`${tab.icon} w-5 h-5`} />
									<span className="text-sm font-medium">{tab.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Contenido del formulario */}
					<div className="flex-1 overflow-y-auto">
						<form onSubmit={handleSubmit} className="p-6">
							{/* Tab: Información Básica */}
							{activeTab === 'basic' && (
								<div className="space-y-6">
									{/* Título */}
									<div className="space-y-1">
										<TextField
											label={t('form.title')}
											value={formData.title}
											onChange={(value) => handleInputChange('title', value)}
											required
											placeholder={t('form.titlePlaceholder')}
											error={formErrors.title}
											className="text-lg font-medium"
										/>
									</div>

									{/* Descripción */}
									<Textarea
										label={t('form.description')}
										value={formData.description}
										onChange={(value) => handleInputChange('description', value)}
										placeholder={t('form.descriptionPlaceholder')}
										rows={3}
										className="resize-none"
									/>

									{/* Categoría y Prioridad */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t('form.category')}
											</span>
											<div className="grid grid-cols-1 gap-2">
												{categoryOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => handleInputChange('category', option.value)}
														className={`
															flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200
															${
																formData.category === option.value
																	? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
																	: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
															}
														`}
													>
														<div className={`${option.icon} w-5 h-5 ${option.color}`} />
														<span className="text-sm font-medium text-gray-900 dark:text-white">
															{option.label}
														</span>
													</button>
												))}
											</div>
										</div>

										<div className="space-y-2">
											<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t('form.priority')}
											</span>
											<div className="space-y-2">
												{priorityOptions.map((option) => (
													<button
														key={option.value}
														type="button"
														onClick={() => handleInputChange('priority', option.value)}
														className={`
															flex items-center space-x-3 w-full p-3 rounded-lg border-2 transition-all duration-200
															${
																formData.priority === option.value
																	? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
																	: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
															}
														`}
													>
														<div className={`${option.icon} w-5 h-5 ${option.color}`} />
														<span className="text-sm font-medium text-gray-900 dark:text-white">
															{option.label}
														</span>
													</button>
												))}
											</div>
										</div>
									</div>

									{/* Fecha y Hora usando DatePicker */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<DatePicker
												legend={t('form.date')}
												label={t('form.date')}
												date={formData.date}
												onDateChange={(date) => handleInputChange('date', date)}
												error={formErrors.date}
											/>
										</div>
										<div className="space-y-1">
											<label
												htmlFor="event-time"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												{t('form.time')}{' '}
												<span className="text-gray-400">({t('form.optional')})</span>
											</label>
											<input
												id="event-time"
												type="time"
												value={formData.time}
												onChange={(e) => handleInputChange('time', e.target.value)}
												className={`
													w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
													focus:ring-2 focus:ring-blue-500 focus:border-transparent
													${
														formErrors.time
															? 'border-red-300 bg-red-50 dark:bg-red-900/20'
															: 'border-gray-200 dark:border-gray-600'
													}
													dark:bg-gray-800 dark:text-white
												`}
											/>
											{formErrors.time && (
												<p className="text-sm text-red-600 dark:text-red-400">{formErrors.time}</p>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Tab: Detalles */}
							{activeTab === 'details' && (
								<div className="space-y-6">
									{/* ID del Animal */}
									<TextField
										label={`${t('form.animalId')} (${t('form.optional')})`}
										value={formData.animalId}
										onChange={(value) => handleInputChange('animalId', value)}
										placeholder={t('form.animalIdPlaceholder')}
									/>

									{/* Ubicación */}
									<TextField
										label={`${t('form.location')} (${t('form.optional')})`}
										value={formData.location}
										onChange={(value) => handleInputChange('location', value)}
										placeholder={t('form.locationPlaceholder')}
									/>

									{/* Notas adicionales */}
									<Textarea
										label={`${t('form.notes')} (${t('form.optional')})`}
										value={formData.notes}
										onChange={(value) => handleInputChange('notes', value)}
										placeholder={t('form.notesPlaceholder')}
										rows={4}
									/>

									{/* Tags */}
									<div className="space-y-2">
										<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											{t('form.tags')} ({t('form.optional')})
										</span>
										<div className="flex flex-wrap gap-2 mb-2">
											{formData.tags.map((tag, index) => (
												<span
													key={index}
													className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
												>
													{tag}
													<button
														type="button"
														onClick={() => handleTagRemove(tag)}
														className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
													>
														<div className="i-heroicons-x-mark w-3 h-3" />
													</button>
												</span>
											))}
										</div>
										<input
											type="text"
											placeholder={t('form.tagsPlaceholder')}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault()
													handleTagAdd(e.currentTarget.value)
													e.currentTarget.value = ''
												}
											}}
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400">{t('form.tagsHint')}</p>
									</div>

									{/* Completado (solo para eventos existentes) */}
									{event && (
										<div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
											<input
												type="checkbox"
												id="completed"
												checked={formData.completed}
												onChange={(e) => handleInputChange('completed', e.target.checked)}
												className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
											/>
											<label
												htmlFor="completed"
												className="text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												{t('form.completed')}
											</label>
										</div>
									)}
								</div>
							)}

							{/* Tab: Recordatorio */}
							{activeTab === 'reminder' && (
								<div className="space-y-6">
									{/* Habilitar recordatorio */}
									<div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
										<input
											type="checkbox"
											id="reminder"
											checked={formData.reminder}
											onChange={(e) => handleInputChange('reminder', e.target.checked)}
											className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
										/>
										<label
											htmlFor="reminder"
											className="text-sm font-medium text-gray-700 dark:text-gray-300"
										>
											{t('reminder.enable')}
										</label>
									</div>

									{formData.reminder && (
										<>
											{/* Tiempo de recordatorio */}
											<div className="space-y-2">
												<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t('reminder.time')}
												</span>
												<div className="grid grid-cols-1 gap-2">
													{reminderOptions.map((option) => (
														<button
															key={option.value}
															type="button"
															onClick={() => handleInputChange('reminderMinutes', option.value)}
															className={`
																flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
																${
																	formData.reminderMinutes === option.value
																		? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
																		: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
																}
															`}
														>
															<span className="text-sm font-medium text-gray-900 dark:text-white">
																{option.label}
															</span>
														</button>
													))}
												</div>
											</div>

											{/* Frecuencia de recordatorio */}
											<div className="space-y-2">
												<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													{t('reminder.frequency')}
												</span>
												<div className="grid grid-cols-2 gap-2">
													{frequencyOptions.map((option) => (
														<button
															key={option.value}
															type="button"
															onClick={() => handleInputChange('reminderFrequency', option.value)}
															className={`
																flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
																${
																	formData.reminderFrequency === option.value
																		? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
																		: 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
																}
															`}
														>
															<span className="text-sm font-medium text-gray-900 dark:text-white">
																{option.label}
															</span>
														</button>
													))}
												</div>
											</div>
										</>
									)}
								</div>
							)}
						</form>
					</div>

					{/* Footer con botones */}
					<div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
						{showDeleteConfirm ? (
							<div className="flex items-center justify-center flex-col space-x-4 gap-4">
								<span className="text-sm text-red-600 dark:text-red-400 font-medium">
									{t('confirmDelete')}
								</span>
								<div className="flex items-center justify-center space-x-3">
									<Button
										variant="danger"
										size="sm"
										onClick={handleDelete}
										loading={deleteLoading}
										className="max-w-40 px-4"
									>
										Eliminar
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowDeleteConfirm(false)}
										className="max-w-40 px-4"
									>
										{t('cancel')}
									</Button>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-end space-x-3">
								<Button
									variant="outline"
									onClick={onClose}
									disabled={loading}
									className="max-w-40 px-6"
								>
									{t('cancel')}
								</Button>
								<Button
									variant="primary"
									onClick={handleSubmit}
									loading={loading}
									className="max-w-40 px-6"
								>
									{loading ? t('saving') : event ? t('update') : t('create')}
								</Button>
							</div>
						)}
					</div>
				</div>
			</Modal>
		)
	}
)
