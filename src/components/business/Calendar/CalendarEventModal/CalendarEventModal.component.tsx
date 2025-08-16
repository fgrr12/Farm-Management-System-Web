import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useId, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/layout/DatePicker'
import { Modal } from '@/components/layout/Modal'
import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useCalendarEventForm } from '@/hooks/forms/useCalendarEventForm'

import type { CalendarEventFormData } from '@/schemas'

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
		const baseId = useId()
		const { t } = useTranslation(['calendar'])
		const [deleteLoading, setDeleteLoading] = useState(false)
		const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
		const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'reminder'>('basic')

		const form = useCalendarEventForm(event || undefined, selectedDate)
		const {
			handleSubmit,
			control,
			register,
			watch,
			formState: { errors, isSubmitting },
			transformToApiFormat,
			getErrorMessage,
			reset,
		} = form

		// Limpiar errores cuando se cierra el modal
		useEffect(() => {
			if (!isOpen) {
				setShowDeleteConfirm(false)
				setActiveTab('basic')
				reset()
			}
		}, [isOpen, reset])

		// Reinicializar cuando se abre el modal
		useEffect(() => {
			if (isOpen) {
				reset()
			}
		}, [isOpen, reset])

		const onSubmit = useCallback(
			async (data: CalendarEventFormData) => {
				try {
					const transformedData = transformToApiFormat(data)
					await onSave(transformedData)
					onClose()
				} catch (error) {
					console.error('Error saving event:', error)
				}
			},
			[transformToApiFormat, onSave, onClose]
		)

		const handleDelete = useCallback(async () => {
			if (!onDelete) return

			setDeleteLoading(true)
			try {
				await onDelete()
				onClose()
			} catch (error) {
				console.error('Error deleting event:', error)
			} finally {
				setDeleteLoading(false)
				setShowDeleteConfirm(false)
			}
		}, [onDelete, onClose])

		const watchedType = watch('type')
		const watchedDate = watch('date')

		const categoryOptions = [
			{
				value: 'task',
				label: t('types.task'),
				icon: 'i-heroicons-clipboard-document-list',
				color: 'text-blue-600',
			},
			{
				value: 'medication',
				label: t('types.medication'),
				icon: 'i-heroicons-beaker',
				color: 'text-red-600',
			},
			{
				value: 'checkup',
				label: t('types.checkup'),
				icon: 'i-heroicons-heart',
				color: 'text-green-600',
			},
			{
				value: 'birth',
				label: t('types.birth'),
				icon: 'i-heroicons-calendar-days',
				color: 'text-purple-600',
			},
			{
				value: 'drying',
				label: t('types.drying'),
				icon: 'i-heroicons-home',
				color: 'text-orange-600',
			},
			{
				value: 'custom',
				label: t('types.custom'),
				icon: 'i-heroicons-cog-6-tooth',
				color: 'text-gray-600',
			},
		] as const

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
		] as const

		const relatedTypeOptions = [
			{ value: undefined, label: t('relatedType.none') },
			{ value: 'animal', label: t('relatedType.animal') },
			{ value: 'task', label: t('relatedType.task') },
			{ value: 'health_record', label: t('relatedType.healthRecord') },
		]

		const statusOptions = [
			{ value: 'pending', label: t('status.pending') },
			{ value: 'completed', label: t('status.completed') },
			{ value: 'cancelled', label: t('status.cancelled') },
			{ value: 'overdue', label: t('status.overdue') },
		] as const

		const selectedCategory = categoryOptions.find((cat) => cat.value === watchedType)
		const formattedDate = watchedDate ? dayjs(watchedDate).format('dddd, MMMM D, YYYY') : ''

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
									<p className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{event && onDelete && (
									<ActionButton
										icon="i-material-symbols-delete-outline"
										onClick={() => setShowDeleteConfirm(true)}
										disabled={isSubmitting || deleteLoading}
									/>
								)}
								<ActionButton
									icon="i-heroicons-x-mark"
									onClick={onClose}
									disabled={isSubmitting || deleteLoading}
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
						<form onSubmit={handleSubmit(onSubmit)} className="p-6">
							{/* Tab: Información Básica */}
							{activeTab === 'basic' && (
								<div className="space-y-6">
									{/* Título */}
									<div className="space-y-1">
										<TextField
											{...register('title')}
											label={t('form.title')}
											required
											placeholder={t('form.titlePlaceholder')}
											error={errors.title ? getErrorMessage(errors.title.message || '') : undefined}
											className="text-lg font-medium"
										/>
									</div>

									{/* Descripción */}
									<Textarea
										{...register('description')}
										label={t('form.description')}
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
											<Controller
												name="type"
												control={control}
												render={({ field }) => (
													<div className="grid grid-cols-1 gap-2">
														{categoryOptions.map((option) => (
															<button
																key={option.value}
																type="button"
																onClick={() => field.onChange(option.value)}
																className={`
																	flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200
																	${
																		field.value === option.value
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
												)}
											/>
										</div>

										<div className="space-y-2">
											<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
												{t('form.priority')}
											</span>
											<Controller
												name="priority"
												control={control}
												render={({ field }) => (
													<div className="space-y-2">
														{priorityOptions.map((option) => (
															<button
																key={option.value}
																type="button"
																onClick={() => field.onChange(option.value)}
																className={`
																	flex items-center space-x-3 w-full p-3 rounded-lg border-2 transition-all duration-200
																	${
																		field.value === option.value
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
												)}
											/>
										</div>
									</div>

									{/* Fecha y Hora */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1">
											<Controller
												name="date"
												control={control}
												render={({ field }) => (
													<DatePicker
														legend={t('form.date')}
														label={t('form.date')}
														date={field.value ? dayjs(field.value) : null}
														onDateChange={(date) => field.onChange(date?.format('YYYY-MM-DD'))}
														error={
															errors.date ? getErrorMessage(errors.date.message || '') : undefined
														}
													/>
												)}
											/>
										</div>
										<div className="space-y-1">
											<label
												htmlFor={`${baseId}-event-time`}
												className="block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												{t('form.time')}{' '}
												<span className="text-gray-400">({t('form.optional')})</span>
											</label>
											<input
												{...register('time')}
												id={`${baseId}-event-time`}
												type="time"
												className={`
													w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
													focus:ring-2 focus:ring-blue-500 focus:border-transparent
													${
														errors.time
															? 'border-red-300 bg-red-50 dark:bg-red-900/20'
															: 'border-gray-200 dark:border-gray-600'
													}
													dark:bg-gray-800 dark:text-white
												`}
											/>
											{errors.time && (
												<p className="text-sm text-red-600 dark:text-red-400">
													{getErrorMessage(errors.time.message || '')}
												</p>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Tab: Detalles */}
							{activeTab === 'details' && (
								<div className="space-y-6">
									{/* Related Type */}
									<div className="space-y-2">
										<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											{t('relatedType')}
										</span>
										<Controller
											name="relatedType"
											control={control}
											render={({ field }) => (
												<div className="space-y-2">
													{relatedTypeOptions.map((option) => (
														<button
															key={option.value || 'none'}
															type="button"
															onClick={() => field.onChange(option.value)}
															className={`
																flex items-center justify-center w-full p-3 rounded-lg border-2 transition-all duration-200
																${
																	field.value === option.value
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
											)}
										/>
									</div>

									{/* Related ID */}
									<Controller
										name="relatedType"
										control={control}
										render={({ field: relatedTypeField }) => (
											<>
												{relatedTypeField.value && (
													<TextField
														{...register('relatedId')}
														label={`${t('placeholders.relatedId')} (${t('form.optional')})`}
														placeholder={t('placeholders.relatedId')}
													/>
												)}
											</>
										)}
									/>

									{/* Status */}
									<div className="space-y-2">
										<span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
											Status
										</span>
										<Controller
											name="status"
											control={control}
											render={({ field }) => (
												<div className="grid grid-cols-2 gap-2">
													{statusOptions.map((option) => (
														<button
															key={option.value}
															type="button"
															onClick={() => field.onChange(option.value)}
															className={`
																flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
																${
																	field.value === option.value
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
											)}
										/>
									</div>
								</div>
							)}

							{/* Tab: Recordatorio */}
							{activeTab === 'reminder' && (
								<div className="space-y-6">
									<div className="text-center py-8">
										<div className="i-heroicons-bell w-12 h-12 text-gray-400 mx-auto mb-4" />
										<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
											{t('reminder.enable')}
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Feature coming soon...
										</p>
									</div>
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
										{t('deleteEvent')}
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
									disabled={isSubmitting}
									className="max-w-40 px-6"
								>
									{t('cancel')}
								</Button>
								<Button
									type="submit"
									variant="primary"
									onClick={handleSubmit(onSubmit)}
									loading={isSubmitting}
									className="max-w-40 px-6"
								>
									{isSubmitting ? t('saving') : event ? t('update') : t('create')}
								</Button>
							</div>
						)}
					</div>
				</div>
			</Modal>
		)
	}
)

CalendarEventModal.displayName = 'CalendarEventModal'
