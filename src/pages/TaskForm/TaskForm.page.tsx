import { memo, useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useTaskForm } from '@/hooks/forms/useTaskForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { TaskFormData } from '@/schemas'

const TaskForm = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['taskForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const form = useTaskForm()
	const {
		handleSubmit,
		control,
		register,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
	} = form

	const onSubmit = useCallback(
		async (data: TaskFormData) => {
			if (!user || !farm) return

			await withLoadingAndError(async () => {
				const taskData = transformToApiFormat(data)
				taskData.uuid = taskData.uuid || crypto.randomUUID()
				taskData.farmUuid = farm.uuid

				await TasksService.setTask(taskData, user.uuid, farm.uuid)
				showToast(t('toast.taskAdded'), 'success')
				navigate(AppRoutes.TASKS)
			}, t('toast.errorAddingTask'))
		},
		[user, farm, transformToApiFormat, withLoadingAndError, showToast, t, navigate]
	)

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	useEffect(() => {
		if (!farm) return
	}, [farm])

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<a
				href="#task-form"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToForm')}
			</a>

			<form
				id="task-form"
				className="flex flex-col items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{t('accessibility.addTaskForm')}
				</h2>

				<TextField
					{...register('title')}
					type="text"
					placeholder={t('name')}
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
					placeholder={t('description')}
					label={t('description')}
					required
					error={errors.description ? getErrorMessage(errors.description.message || '') : undefined}
					aria-describedby="description-help"
				/>
				<div id="description-help" className="sr-only">
					{t('accessibility.descriptionHelp')}
				</div>

				<Controller
					name="priority"
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							legend={t('selectPriority')}
							defaultLabel={t('selectPriority')}
							items={[
								{ value: 'low', name: t('priorities.low') },
								{ value: 'medium', name: t('priorities.medium') },
								{ value: 'high', name: t('priorities.high') },
							]}
							required
							error={errors.priority ? getErrorMessage(errors.priority.message || '') : undefined}
							aria-describedby="priority-help"
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
						<Select
							{...field}
							legend={t('selectSpecies')}
							defaultLabel={t('selectSpecies')}
							optionValue="uuid"
							optionLabel="name"
							items={species}
							required
							error={
								errors.speciesUuid ? getErrorMessage(errors.speciesUuid.message || '') : undefined
							}
							aria-describedby="species-help"
						/>
					)}
				/>
				<div id="species-help" className="sr-only">
					{t('accessibility.speciesHelp')}
				</div>

				<Button type="submit" disabled={isSubmitting} aria-describedby="submit-help">
					{isSubmitting ? t('common:loading') : t('addTask')}
				</Button>
				<div id="submit-help" className="sr-only">
					{t('accessibility.submitHelp')}
				</div>
			</form>
		</div>
	)
}

export default memo(TaskForm)
