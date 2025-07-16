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

	const handleTextChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
	}, [])

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleSubmit = useCallback(async (event: FormEvent) => {
		if (!user || !farm) return

		event.preventDefault()

		await withLoadingAndError(
			async () => {
				task.uuid = task.uuid || crypto.randomUUID()
				await TasksService.setTask(task, user.uuid, farm.uuid)
				showToast(t('toast.taskAdded'), 'success')
				navigate(AppRoutes.TASKS)
			},
			t('toast.errorAddingTask')
		)
	}, [user, farm, task, withLoadingAndError, showToast, t, navigate])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	useEffect(() => {
		if (!farm) return
	}, [farm])

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<TextField
					name="title"
					type="text"
					placeholder={t('name')}
					label={t('name')}
					value={task.title}
					onChange={handleTextChange}
					required
				/>
				<Textarea
					name="description"
					placeholder={t('description')}
					label={t('description')}
					value={task.description}
					onChange={handleTextChange}
					required
				/>
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
				/>
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
				/>
				<Button type="submit">{t('addTask')}</Button>
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
