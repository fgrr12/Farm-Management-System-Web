import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TaskColumn } from '@/components/business/Tasks/TaskColumn'
import { TaskFilters } from '@/components/business/Tasks/TaskFilters'
import { TaskModal } from '@/components/business/Tasks/TaskModal'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader, PageHeaderStats } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'

import { useTasks, useUpdateTask } from '@/hooks/queries/useTasks'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { TaskColumnInfo, TaskColumns, TaskFilters as TaskFiltersType } from './Tasks.types'

const Tasks = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])
	const { setPageTitle, showToast } = usePagePerformance()

	const [filters, setFilters] = useState<TaskFiltersType>(INITIAL_FILTERS)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const { data: tasks, isLoading } = useTasks({
		farmUuid: farm?.uuid || '',
		search: '',
		status: '',
		priority: filters.priority,
		speciesUuid: filters.speciesUuid,
	})

	const updateTask = useUpdateTask()

	// Group tasks by status
	const taskColumns: TaskColumns = {
		todo: tasks?.filter((task) => task.status === 'todo') || [],
		'in-progress': tasks?.filter((task) => task.status === 'in-progress') || [],
		done: tasks?.filter((task) => task.status === 'done') || [],
	}

	const handleAddTask = useCallback(() => {
		navigate(AppRoutes.ADD_TASK)
	}, [navigate])

	const handleFiltersChange = useCallback((newFilters: TaskFiltersType) => {
		setFilters(newFilters)
	}, [])

	const handleTaskClick = useCallback((task: Task) => {
		setSelectedTask(task)
		setIsModalOpen(true)
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
		setSelectedTask(null)
	}, [])

	const handleTaskMove = useCallback(
		async (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
			if (fromStatus === toStatus) return

			const task = tasks?.find((t) => t.uuid === taskId)
			if (!task || !user) return

			try {
				await updateTask.mutateAsync({
					task: { ...task, status: toStatus },
					userUuid: user.uuid,
				})

				showToast(
					t('toast.taskMoved', {
						status: t(`status.${toStatus}`),
					}),
					'success'
				)
			} catch {
				showToast(t('toast.errorUpdatingTaskStatus'), 'error')
			}
		},
		[tasks, user, updateTask, showToast, t]
	)

	// Drag and drop monitor
	useEffect(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				const destination = location.current.dropTargets[0]
				if (!destination) return

				const taskId = source.data.taskId as string
				const currentStatus = source.data.currentStatus as TaskStatus
				const newStatus = destination.data.status as TaskStatus

				if (currentStatus !== newStatus) {
					handleTaskMove(taskId, currentStatus, newStatus)
				}
			},
		})
	}, [handleTaskMove])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer>
			<a
				href="#kanban-board"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToTasks')}
			</a>

			<PageHeader
				icon="task"
				title={t('title')}
				subtitle={t('subtitle')}
				stats={
					<PageHeaderStats
						stats={[
							{
								value: taskColumns.todo.length + taskColumns['in-progress'].length,
								label: t('activeTasks'),
							},
							{
								value: taskColumns.done.length,
								label: t('completedTasks'),
							},
						]}
					/>
				}
				actions={
					<div className="flex items-center justify-between gap-4">
						<div className="flex-1 max-w-md">
							<TaskFilters
								filters={filters}
								onFiltersChange={handleFiltersChange}
								species={species}
							/>
						</div>

						<div className="shrink-0">
							<Button
								onClick={handleAddTask}
								aria-describedby="add-task-description"
								className="btn btn-primary h-12 text-base sm:text-lg px-6 sm:px-8 dark:bg-blue-600 dark:hover:bg-blue-700"
							>
								<i className="i-material-symbols-add-circle-outline w-5! h-5! mr-2" />
								{t('addTask')}
							</Button>
							<div id="add-task-description" className="sr-only">
								{t('accessibility.addTaskDescription')}
							</div>
						</div>
					</div>
				}
			/>

			{/* Kanban Board */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
				<main id="kanban-board" className="p-4 sm:p-6">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="loading loading-spinner loading-lg text-primary" />
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 min-h-[600px]">
							{COLUMN_CONFIG.map((column) => (
								<TaskColumn
									key={column.id}
									status={column.id}
									title={t(`status.${column.id}`)}
									tasks={taskColumns[column.id]}
									color={column.color}
									bgColor={column.bgColor}
									onTaskClick={handleTaskClick}
								/>
							))}
						</div>
					)}
				</main>
			</div>

			{/* Task Modal */}
			<TaskModal task={selectedTask} isOpen={isModalOpen} onClose={handleCloseModal} />
		</PageContainer>
	)
}

const INITIAL_FILTERS: TaskFiltersType = {
	priority: '',
	speciesUuid: '',
}

const COLUMN_CONFIG: TaskColumnInfo[] = [
	{
		id: 'todo',
		title: 'To Do',
		color: 'gray-500',
		bgColor: 'gray-50',
	},
	{
		id: 'in-progress',
		title: 'In Progress',
		color: 'blue-500',
		bgColor: 'blue-50',
	},
	{
		id: 'done',
		title: 'Done',
		color: 'green-500',
		bgColor: 'green-50',
	},
]

export default memo(Tasks)
