import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { TasksService } from '@/services/tasks'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

const TaskForm = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['taskForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [task, setTask] = useState(INITIAL_TASK)

	const handleTextChange = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = event.target
			setTask((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
		},
		[]
	)

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleSubmit = useCallback(
		async (event: FormEvent) => {
			if (!user || !farm) return

			event.preventDefault()

			await withLoadingAndError(async () => {
				task.uuid = task.uuid || crypto.randomUUID()
				await TasksService.setTask(task, user.uuid, farm.uuid)
				showToast(t('toast.taskAdded'), 'success')
				navigate(AppRoutes.TASKS)
			}, t('toast.errorAddingTask'))
		},
		[user, farm, task, withLoadingAndError, showToast, t, navigate]
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
				onSubmit={handleSubmit}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{t('accessibility.addTaskForm')}
				</h2>

				<TextField
					name="title"
					type="text"
					placeholder={t('name')}
					label={t('name')}
					value={task.title}
					onChange={handleTextChange}
					required
					aria-describedby="title-help"
					autoComplete="off"
				/>
				<div id="title-help" className="sr-only">
					{t('accessibility.titleHelp')}
				</div>

				<Textarea
					name="description"
					placeholder={t('description')}
					label={t('description')}
					value={task.description}
					onChange={handleTextChange}
					required
					aria-describedby="description-help"
				/>
				<div id="description-help" className="sr-only">
					{t('accessibility.descriptionHelp')}
				</div>

				<Select
					name="priority"
					legend={t('selectPriority')}
					defaultLabel={t('selectPriority')}
					value={task.priority}
					items={[
						{ value: 'low', name: t('priorities.low') },
						{ value: 'medium', name: t('priorities.medium') },
						{ value: 'high', name: t('priorities.high') },
					]}
					onChange={handleSelectChange}
					required
					aria-describedby="priority-help"
				/>
				<div id="priority-help" className="sr-only">
					{t('accessibility.priorityHelp')}
				</div>

				<Select
					name="speciesUuid"
					legend={t('selectSpecies')}
					defaultLabel={t('selectSpecies')}
					optionValue="uuid"
					optionLabel="name"
					value={task.speciesUuid}
					items={species}
					onChange={handleSelectChange}
					required
					aria-describedby="species-help"
				/>
				<div id="species-help" className="sr-only">
					{t('accessibility.speciesHelp')}
				</div>

				<Button type="submit" aria-describedby="submit-help">
					{t('addTask')}
				</Button>
				<div id="submit-help" className="sr-only">
					{t('accessibility.submitHelp')}
				</div>
			</form>
		</div>
	)
}

const INITIAL_TASK: Task = {
	uuid: '',
	title: '',
	description: '',
	priority: '',
	status: 'PENDING',
	speciesUuid: '',
	farmUuid: '',
}

export default memo(TaskForm)
