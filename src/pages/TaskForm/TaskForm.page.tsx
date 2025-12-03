import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'



import { DatePicker } from '@/components/layout/DatePicker'
import { Button } from '@/components/ui/Button'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useTaskForm } from '@/hooks/forms/useTaskForm'
import { useCreateTask } from '@/hooks/queries/useTasks'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { TaskFormData } from '@/schemas'

const TaskForm = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['taskForm'])
	const { setPageTitle, showToast } = usePagePerformance()

	const form = useTaskForm()
	const {
		handleSubmit,
		control,
		register,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
	} = form

	const priorityOptions: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'low', label: t('priorities.low') },
			{ value: 'medium', label: t('priorities.medium') },
			{ value: 'high', label: t('priorities.high') },
			{ value: 'critical', label: t('priorities.critical') },
		],
		[t]
	)

	const speciesOptions: CustomSelectOption[] = useMemo(
		() => species.map((s) => ({ value: s.uuid, label: s.name })),
		[species]
	)

	const createTask = useCreateTask()

	const onSubmit = useCallback(
		async (data: TaskFormData) => {
			if (!user || !farm) return

			try {
				const taskData = transformToApiFormat(data)
				taskData.uuid = taskData.uuid || crypto.randomUUID()
				taskData.farmUuid = farm.uuid

				await createTask.mutateAsync({
					task: taskData,
					userUuid: user.uuid,
				})
				showToast(t('toast.taskAdded'), 'success')
				navigate(AppRoutes.TASKS)
			} catch {
				showToast(t('toast.errorAddingTask'), 'error')
			}
		},
		[user, farm, transformToApiFormat, createTask, showToast, t, navigate]
	)

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#task-form"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToForm')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-linear-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
								<i className="i-material-symbols-task bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{t('title')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">{t('subtitle')}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
					<form
						id="task-form"
						className="p-4 sm:p-6 lg:p-8"
						onSubmit={handleSubmit(onSubmit)}
						autoComplete="off"
						aria-labelledby="form-heading"
						noValidate
					>
						<h2 id="form-heading" className="sr-only">
							{t('accessibility.addTaskForm')}
						</h2>

						<div className="space-y-6">
							{/* Basic Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-info w-5! h-5! bg-blue-600!" />
									{t('basicInformation')}
								</h3>
								<div className="space-y-4">
									<TextField
										{...register('title')}
										type="text"
										placeholder={t('placeholders.taskName')}
										label={t('name')}
										required
										error={errors.title ? getErrorMessage(errors.title.message || '') : undefined}
										aria-describedby="title-help"
										autoComplete="off"
									/>
									<div id="title-help" className="sr-only">
										{t('accessibility.titleHelp')}
									</div>

									<Textarea
										{...register('description')}
										placeholder={t('placeholders.taskDescription')}
										label={t('description')}
										required
										error={
											errors.description
												? getErrorMessage(errors.description.message || '')
												: undefined
										}
										aria-describedby="description-help"
									/>
									<div id="description-help" className="sr-only">
										{t('accessibility.descriptionHelp')}
									</div>
								</div>
							</div>

							{/* Task Settings Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-settings w-5! h-5! bg-blue-600!" />
									{t('taskSettings')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Controller
										name="priority"
										control={control}
										render={({ field }) => (
											<CustomSelect
												label={t('selectPriority')}
												placeholder={t('placeholders.priorityHint')}
												value={field.value}
												onChange={field.onChange}
												options={priorityOptions}
												required
												error={
													errors.priority
														? getErrorMessage(errors.priority.message || '')
														: undefined
												}
											/>
										)}
									/>
									<div id="priority-help" className="sr-only">
										{t('accessibility.priorityHelp')}
									</div>

									<Controller
										name="speciesUuid"
										control={control}
										render={({ field }) => (
											<CustomSelect
												label={t('selectSpecies')}
												placeholder={t('placeholders.speciesHint')}
												value={field.value}
												onChange={field.onChange}
												options={speciesOptions}
												required
												error={
													errors.speciesUuid
														? getErrorMessage(errors.speciesUuid.message || '')
														: undefined
												}
											/>
										)}
									/>
									<div id="species-help" className="sr-only">
										{t('accessibility.speciesHelp')}
									</div>
								</div>

								{/* Due Date */}
								<div>
									<Controller
										name="dueDate"
										control={control}
										render={({ field }) => (
											<DatePicker
												legend={t('selectDueDate')}
												label={t('placeholders.dueDateHint')}
												date={field.value ? dayjs(field.value) : null}
												onDateChange={(date) => {
													field.onChange(date ? date.toISOString() : '')
												}}
												error={
													errors.dueDate ? getErrorMessage(errors.dueDate.message || '') : undefined
												}
											/>
										)}
									/>
									<div id="due-date-help" className="sr-only">
										{t('accessibility.dueDateHelp')}
									</div>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								disabled={isSubmitting}
								aria-describedby="submit-help"
								className="btn btn-primary h-12 w-full text-lg disabled:loading flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<>
										<i className="i-material-symbols-hourglass-empty w-5! h-5! animate-spin" />
										{t('common:loading')}
									</>
								) : (
									<>
										<i className="i-material-symbols-add-task w-5! h-5!" />
										{t('addTask')}
									</>
								)}
							</Button>
							<div id="submit-help" className="sr-only">
								{t('accessibility.submitHelp')}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default memo(TaskForm)
