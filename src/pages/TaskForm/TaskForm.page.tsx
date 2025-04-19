import { AppRoutes } from '@/config/constants/routes'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { TasksService } from '@/services/tasks'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const TaskForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['taskForm'])

	const [task, setTask] = useState(INITIAL_TASK)
	const [species, setSpecies] = useState(INITIAL_SPECIES)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		try {
			setLoading(true)
			task.uuid = task.uuid || crypto.randomUUID()
			await TasksService.setTask(task, user!.uuid, farm!.uuid)
			navigate(AppRoutes.TASKS)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorAddingTask.title'),
				message: t('modal.errorAddingTask.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])

	useEffect(() => {
		if (!farm) return
		setSpecies(farm!.species!)
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
					name="species"
					legend={t('selectSpecies')}
					defaultLabel={t('selectSpecies')}
					optionValue="uuid"
					optionLabel="name"
					value={task.species}
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
	species: '',
	farmUuid: '',
}

const INITIAL_SPECIES: Species[] = [
	{
		uuid: crypto.randomUUID(),
		name: '',
		breeds: [
			{
				uuid: crypto.randomUUID(),
				name: '',
				gestationPeriod: 0,
			},
		],
		status: true,
	},
]
