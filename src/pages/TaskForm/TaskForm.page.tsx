import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { DatePicker } from '@/components/layout/DatePicker'
import { FormLayout } from '@/components/layout/FormLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
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
	const { setPageTitle, showToast, withError } = usePagePerformance()

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

			await withError(async () => {
				const taskData = transformToApiFormat(data)
				taskData.uuid = taskData.uuid || crypto.randomUUID()
				taskData.farmUuid = farm.uuid

				await createTask.mutateAsync({
					task: taskData,
					userUuid: user.uuid,
				})
				showToast(t('toast.taskAdded'), 'success')
				navigate(AppRoutes.TASKS)
			}, t('toast.errorAddingTask'))
		},
		[user, farm, transformToApiFormat, createTask, showToast, t, navigate, withError]
	)

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer maxWidth="4xl">
			<PageHeader icon="task" title={t('title')} subtitle={t('subtitle')} variant="compact" />

			<FormLayout
				sections={[
					{
						title: t('basicInformation'),
						icon: 'info',
						columns: 1,
						children: (
							<>
								<TextField
									{...register('title')}
									type="text"
									placeholder={t('placeholders.taskName')}
									label={t('name')}
									required
									error={errors.title ? getErrorMessage(errors.title.message || '') : undefined}
									autoComplete="off"
								/>

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
								/>
							</>
						),
					},
					{
						title: t('taskSettings'),
						icon: 'settings',
						columns: 2,
						children: (
							<>
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
												errors.priority ? getErrorMessage(errors.priority.message || '') : undefined
											}
										/>
									)}
								/>

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
							</>
						),
					},
				]}
				onSubmit={handleSubmit(onSubmit)}
				submitButton={{
					label: t('addTask'),
					isSubmitting,
					icon: 'add-task',
				}}
			/>
		</PageContainer>
	)
}

export default memo(TaskForm)
