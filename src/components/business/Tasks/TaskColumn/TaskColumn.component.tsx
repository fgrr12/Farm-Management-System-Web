import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TaskCard } from '../TaskCard'
import type { TaskColumnProps } from './TaskColumn.types'

export const TaskColumn: FC<TaskColumnProps> = memo(
	({ status, title, tasks, color, bgColor, onSearch, onTaskClick }) => {
		const { t } = useTranslation(['tasks'])
		const ref = useRef<HTMLDivElement>(null)
		const [isDraggedOver, setIsDraggedOver] = useState(false)
		const [search, setSearch] = useState('')

		const filteredTasks = useMemo(() => {
			if (!search.trim()) return tasks

			return tasks.filter(
				(task) =>
					task.title.toLowerCase().includes(search.toLowerCase()) ||
					task.description.toLowerCase().includes(search.toLowerCase())
			)
		}, [tasks, search])

		const handleSearchChange = (value: string) => {
			setSearch(value)
			onSearch?.(value)
		}

		useEffect(() => {
			const el = ref.current
			if (!el) return

			return dropTargetForElements({
				element: el,
				getData: () => ({ status, type: 'column' }),
				onDragEnter: () => setIsDraggedOver(true),
				onDragLeave: () => setIsDraggedOver(false),
				onDrop: () => setIsDraggedOver(false),
			})
		}, [status])

		return (
			<div
				ref={ref}
				className={`
		flex flex-col h-full min-h-[600px] rounded-lg shadow-sm border-2 transition-all duration-200 relative
		${
			isDraggedOver
				? `border-${color} bg-${bgColor} dark:border-${color} dark:bg-${bgColor}`
				: 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
		}
	`}
				role="region"
				aria-labelledby={`column-${status}-heading`}
			>
				{/* Column Header */}
				<div
					className={`p-4 border-b border-gray-200 dark:border-gray-600 bg-${bgColor} dark:bg-gray-700`}
				>
					<div className="flex items-center justify-between mb-3">
						<h2
							id={`column-${status}-heading`}
							className={`text-lg font-semibold text-${color} dark:text-${color} flex items-center gap-2`}
						>
							<div className={`w-3 h-3 rounded-full bg-${color}`} />
							{title}
							<span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${color} text-white`}>
								{tasks.length}
							</span>
						</h2>
					</div>

					{/* Search */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<div className="w-4 h-4 i-material-symbols-search text-gray-400 dark:text-gray-500" />
						</div>
						<input
							type="search"
							className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
							placeholder={t('searchInColumn')}
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							aria-label={t('searchInColumn')}
						/>
					</div>
				</div>

				{/* Tasks List */}
				<div className="flex-1 p-4 overflow-y-auto relative">
					<div className="space-y-3">
						{filteredTasks.map((task) => (
							<TaskCard key={task.uuid} task={task} draggable={true} onTaskClick={onTaskClick} />
						))}

						{filteredTasks.length === 0 && !search && (
							<div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
								<div className="w-12 h-12 i-material-symbols-task-alt mb-3" />
								<p className="text-sm text-center">{t('noTasksInColumn')}</p>
							</div>
						)}

						{filteredTasks.length === 0 && search && (
							<div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
								<div className="w-12 h-12 i-material-symbols-search-off mb-3" />
								<p className="text-sm text-center">{t('noTasksFound')}</p>
							</div>
						)}
					</div>

					{/* Drop zone indicator - confined to tasks area only */}
					{isDraggedOver && (
						<div className="absolute inset-0 pointer-events-none">
							<div
								className={`w-full h-full border-2 border-dashed border-${color} bg-${bgColor} dark:bg-${bgColor} bg-opacity-15 dark:bg-opacity-20 rounded-md flex items-center justify-center`}
							>
								<div
									className={`bg-${color} text-white text-sm font-medium px-3 py-2 rounded-md shadow-lg`}
								>
									{t('dropTaskHere')}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		)
	}
)
