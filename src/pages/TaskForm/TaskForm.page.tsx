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

import * as S from './TaskForm.styles'

export const TaskForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['taskForm'])

	const [task, setTask] = useState(INITIAL_TASK)

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

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
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
					label={t('priority')}
					value={task.priority}
					onChange={handleSelectChange}
					required
				>
					<option value="" disabled>
						{t('priorities.default')}
					</option>
					<S.PriorityOption $priority="low">{t('priorities.low')}</S.PriorityOption>
					<S.PriorityOption $priority="medium">{t('priorities.medium')}</S.PriorityOption>
					<S.PriorityOption $priority="high">{t('priorities.high')}</S.PriorityOption>
				</Select>
				<Select
					name="species"
					label={t('species')}
					value={task.species}
					onChange={handleSelectChange}
					required
				>
					<option value="" disabled>
						{t('selectSpecies')}
					</option>
					{farm?.species.map((species, index) => (
						<option key={index} value={species}>
							{species}
						</option>
					))}
				</Select>
				<Button type="submit">{t('addTask')}</Button>
			</S.Form>
		</S.Container>
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
