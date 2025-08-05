import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/layout/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
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
		const [formData, setFormData] = useState({
			title: '',
			description: '',
			category: 'task' as CalendarEvent['type'],
			priority: 'medium' as CalendarEvent['priority'],
			date: '',
			time: '',
			animalId: '',
			completed: false,
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
					date: eventDate.format('YYYY-MM-DD'),
					time: event.time ? eventDate.format('HH:mm') : '',
					animalId: event.animalUuid || '',
					completed: event.status === 'completed',
				})
			} else if (selectedDate) {
				setFormData((prev) => ({
					...prev,
					date: selectedDate.format('YYYY-MM-DD'),
					time: dayjs().format('HH:mm'),
				}))
			}
		}, [event, selectedDate])

		const handleInputChange = useCallback((field: string, value: any) => {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}))
		}, [])

		const handleSubmit = useCallback(
			async (e: React.FormEvent) => {
				e.preventDefault()

				if (!formData.title.trim()) return

				setLoading(true)
				try {
					// Combinar fecha y hora
					const dateTime = formData.time
						? dayjs(`${formData.date} ${formData.time}`)
						: dayjs(formData.date)

					const eventData = {
						title: formData.title.trim(),
						description: formData.description.trim(),
						type: formData.category as CalendarEvent['type'],
						priority: formData.priority,
						date: dateTime.toISOString(),
						time: formData.time,
						animalUuid: formData.animalId.trim() || undefined,
						status: formData.completed ? 'completed' : ('pending' as CalendarEvent['status']),
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
			[formData, event, onSave]
		)

		const handleDelete = useCallback(async () => {
			if (!onDelete) return

			if (confirm(t('confirmDelete'))) {
				setLoading(true)
				try {
					await onDelete()
				} catch (error) {
					console.error('Error deleting event:', error)
				} finally {
					setLoading(false)
				}
			}
		}, [onDelete, t])

		const categoryOptions = [
			{ value: 'task', label: t('categories.task') },
			{ value: 'medication', label: t('categories.medication') },
			{ value: 'vaccination', label: t('categories.health') },
			{ value: 'appointment', label: t('categories.breeding') },
			{ value: 'general', label: t('categories.feeding') },
		]

		const priorityOptions = [
			{ value: 'low', label: t('priority.low') },
			{ value: 'medium', label: t('priority.medium') },
			{ value: 'high', label: t('priority.high') },
		]

		return (
			<Modal open={isOpen} onClose={onClose} size="md">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{event ? t('editEvent') : t('createEvent')}
						</h2>
						<div className="flex items-center space-x-2">
							{event && onDelete && (
								<button
									type="button"
									onClick={handleDelete}
									disabled={loading}
									className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
								>
									<div className="i-heroicons-trash w-5 h-5" />
								</button>
							)}
							<button
								type="button"
								onClick={onClose}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<div className="i-heroicons-x-mark w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Formulario */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Título */}
						<TextField
							label={t('form.title')}
							value={formData.title}
							onChange={(value) => handleInputChange('title', value)}
							required
							placeholder={t('form.titlePlaceholder')}
						/>

						{/* Descripción */}
						<Textarea
							label={t('form.description')}
							value={formData.description}
							onChange={(value) => handleInputChange('description', value)}
							placeholder={t('form.descriptionPlaceholder')}
							rows={3}
						/>

						{/* Categoría y Prioridad */}
						<div className="grid grid-cols-2 gap-4">
							<Select
								label={t('form.category')}
								value={formData.category}
								onChange={(value) => handleInputChange('category', value)}
								items={categoryOptions}
							/>
							<Select
								label={t('form.priority')}
								value={formData.priority}
								onChange={(value) => handleInputChange('priority', value)}
								items={priorityOptions}
							/>
						</div>

						{/* Fecha y Hora */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="event-date"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									{t('form.date')}
								</label>
								<input
									id="event-date"
									type="date"
									value={formData.date}
									onChange={(e) => handleInputChange('date', e.target.value)}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label
									htmlFor="event-time"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									{t('form.time')} ({t('form.optional')})
								</label>
								<input
									id="event-time"
									type="time"
									value={formData.time}
									onChange={(e) => handleInputChange('time', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						{/* ID del Animal */}
						<TextField
							label={`${t('form.animalId')} (${t('form.optional')})`}
							value={formData.animalId}
							onChange={(value) => handleInputChange('animalId', value)}
							placeholder={t('form.animalIdPlaceholder')}
						/>

						{/* Completado (solo para eventos existentes) */}
						{event && (
							<div className="flex items-center">
								<input
									type="checkbox"
									id="completed"
									checked={formData.completed}
									onChange={(e) => handleInputChange('completed', e.target.checked)}
									className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label
									htmlFor="completed"
									className="ml-2 text-sm text-gray-700 dark:text-gray-300"
								>
									{t('form.completed')}
								</label>
							</div>
						)}

						{/* Botones */}
						<div className="flex justify-end space-x-3 pt-4">
							<Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
								{t('cancel')}
							</Button>
							<Button type="submit" disabled={loading || !formData.title.trim()}>
								{loading ? t('saving') : event ? t('update') : t('create')}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		)
	}
)
