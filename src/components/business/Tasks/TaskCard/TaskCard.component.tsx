import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { type FC, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useIsMobile } from '@/hooks/ui/useIsMobile'

import type { TaskPriority, TaskStatus } from '@/types'
import type { TaskCardProps } from './TaskCard.types'

export const TaskCard: FC<TaskCardProps> = memo(
	({ task, draggable: isDraggable = false, onTaskClick }) => {
		const { t } = useTranslation(['tasks'])
		const ref = useRef<HTMLDivElement>(null)
		const [dragging, setDragging] = useState(false)
		const [touchStartTime, setTouchStartTime] = useState(0)
		const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 })
		const isMobile = useIsMobile()

		const getPriorityIcon = useCallback((priority: TaskPriority) => {
			switch (priority) {
				case 'low':
					return 'i-material-symbols-keyboard-arrow-down bg-green-600! dark:bg-green-400!'
				case 'medium':
					return 'i-material-symbols-remove bg-yellow-600! dark:bg-yellow-400!'
				case 'high':
					return 'i-material-symbols-keyboard-arrow-up bg-red-600! dark:bg-red-400!'
				case 'critical':
					return 'i-material-symbols-warning bg-red-700! dark:bg-red-500!'
				default:
					return 'i-material-symbols-remove bg-gray-600! dark:bg-gray-400!'
			}
		}, [])

		const getStatusIcon = useCallback((status: TaskStatus) => {
			switch (status) {
				case 'todo':
					return 'i-material-symbols-radio-button-unchecked bg-gray-500! dark:bg-gray-400!'
				case 'in-progress':
					return 'i-material-symbols-hourglass-empty bg-blue-500! dark:bg-blue-400!'
				case 'done':
					return 'i-material-symbols-check-circle bg-green-500! dark:bg-green-400!'
				case 'archived':
					return 'i-material-symbols-archive bg-gray-400! dark:bg-gray-300!'
				default:
					return 'i-material-symbols-radio-button-unchecked bg-gray-500! dark:bg-gray-400!'
			}
		}, [])

		const getPriorityGradient = useCallback((priority: TaskPriority) => {
			switch (priority) {
				case 'critical':
					return {
						light: 'linear-gradient(90deg, #dc2626, #991b1b, #7f1d1d)',
						dark: 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)',
					}
				case 'high':
					return {
						light: 'linear-gradient(90deg, #ef4444, #dc2626)',
						dark: 'linear-gradient(90deg, #f87171, #ef4444)',
					}
				case 'medium':
					return {
						light: 'linear-gradient(90deg, #eab308, #ca8a04)',
						dark: 'linear-gradient(90deg, #fbbf24, #eab308)',
					}
				case 'low':
					return {
						light: 'linear-gradient(90deg, #22c55e, #16a34a)',
						dark: 'linear-gradient(90deg, #4ade80, #22c55e)',
					}
				default:
					return {
						light: 'linear-gradient(90deg, #6b7280, #4b5563)',
						dark: 'linear-gradient(90deg, #9ca3af, #6b7280)',
					}
			}
		}, [])

		const getPriorityBorderStyle = useCallback((priority: TaskPriority) => {
			switch (priority) {
				case 'critical':
					return 'border-2 border-red-500 dark:border-red-400 hover:border-red-600 dark:hover:border-red-300 shadow-red-100 dark:shadow-red-900/20'
				case 'high':
					return 'border-2 border-red-400 dark:border-red-300 hover:border-red-500 dark:hover:border-red-200 shadow-red-50 dark:shadow-red-900/10'
				case 'medium':
					return 'border-2 border-yellow-400 dark:border-yellow-300 hover:border-yellow-500 dark:hover:border-yellow-200 shadow-yellow-50 dark:shadow-yellow-900/10'
				case 'low':
					return 'border-2 border-green-400 dark:border-green-300 hover:border-green-500 dark:hover:border-green-200 shadow-green-50 dark:shadow-green-900/10'
				default:
					return 'border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
			}
		}, [])

		useEffect(() => {
			const el = ref.current
			if (!el || !isDraggable) return

			const cleanup = draggable({
				element: el,
				getInitialData: () => ({
					taskId: task.uuid,
					currentStatus: task.status,
					type: 'task',
				}),
				canDrag: () => {
					if (isMobile && touchStartTime > 0) {
						return Date.now() - touchStartTime > 300
					}
					return !isMobile
				},
				onDragStart: () => {
					setDragging(true)
					if (el) {
						el.style.transform = 'scale(1.02) rotate(1deg)'
					}
				},
				onDrop: () => {
					setDragging(false)
					if (el) {
						el.style.transform = ''
					}
				},
			})

			return cleanup
		}, [isDraggable, task.uuid, task.status, isMobile, touchStartTime])

		const handleCardClick = useCallback(() => {
			if (onTaskClick && !dragging) {
				onTaskClick(task)
			}
		}, [onTaskClick, task, dragging])

		// Touch handlers for better mobile experience
		const handleTouchStart = useCallback(
			(e: React.TouchEvent) => {
				if (!isMobile || !isDraggable) return

				const touch = e.touches[0]
				setTouchStartTime(Date.now())
				setTouchStartPos({ x: touch.clientX, y: touch.clientY })
			},
			[isMobile, isDraggable]
		)

		const handleTouchMove = useCallback(
			(e: React.TouchEvent) => {
				if (!isMobile || !isDraggable) return

				const touch = e.touches[0]
				const deltaX = Math.abs(touch.clientX - touchStartPos.x)
				const deltaY = Math.abs(touch.clientY - touchStartPos.y)
				const timeDiff = Date.now() - touchStartTime

				// If user has moved significantly or held for long enough, prevent click
				if ((deltaX > 10 || deltaY > 10) && timeDiff > 150) {
					e.preventDefault()
				}
			},
			[isMobile, isDraggable, touchStartPos, touchStartTime]
		)

		const handleTouchEnd = useCallback(
			(e: React.TouchEvent) => {
				if (!isMobile || !isDraggable) return

				const timeDiff = Date.now() - touchStartTime
				const touch = e.changedTouches[0]
				const deltaX = Math.abs(touch.clientX - touchStartPos.x)
				const deltaY = Math.abs(touch.clientY - touchStartPos.y)

				// If it was a quick tap with minimal movement, treat as click
				if (timeDiff < 200 && deltaX < 10 && deltaY < 10) {
					handleCardClick()
				}
			},
			[isMobile, isDraggable, touchStartTime, touchStartPos, handleCardClick]
		)

		return (
			<div
				ref={ref}
				className={`
				card bg-white dark:bg-gray-800 w-full shadow-sm rounded-xl overflow-hidden
				transition-all duration-200 hover:shadow-xl dark:hover:shadow-2xl
				${!isMobile ? 'hover:-translate-y-0.5' : ''}
				${isDraggable ? 'cursor-grab' : onTaskClick ? 'cursor-pointer' : ''}
				${dragging ? 'opacity-90 shadow-2xl z-10 ring-2 ring-blue-300 dark:ring-blue-400' : ''}
				${isMobile ? 'touch-manipulation select-none' : ''}
				${getPriorityBorderStyle(task.priority)}
			`}
				role="article"
				aria-labelledby={`task-${task.uuid}-title`}
				aria-describedby={`task-${task.uuid}-description`}
				onClick={!isMobile ? handleCardClick : undefined}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div className="card-body p-4">
					{/* Header with status and priority */}
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<div className={`w-4 h-4 ${getStatusIcon(task.status)}`} />
							<span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
								{t(`status.${task.status}`)}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<div className={`w-4 h-4 ${getPriorityIcon(task.priority)}`} />
							<span className="text-sm text-gray-500 dark:text-gray-400">
								{t(`priority.${task.priority}`)}
							</span>
						</div>
					</div>

					{/* Task content */}
					<div className="flex-1">
						<h3
							id={`task-${task.uuid}-title`}
							className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2"
						>
							{task.title}
						</h3>
						<p
							id={`task-${task.uuid}-description`}
							className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap"
						>
							{task.description}
						</p>
					</div>

					{/* Priority indicator bar with gradient */}
					<div className="mt-3">
						<div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								className={'h-full rounded-full transition-all duration-300'}
								style={{
									background: window.matchMedia('(prefers-color-scheme: dark)').matches
										? getPriorityGradient(task.priority).dark
										: getPriorityGradient(task.priority).light,
								}}
							/>
						</div>
					</div>

					{/* Timestamps */}
					{(task.createdAt || task.updatedAt) && (
						<div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
							{task.updatedAt && (
								<span>
									{t('updatedAt')}: {new Date(task.updatedAt).toLocaleDateString()}
								</span>
							)}
							{!task.updatedAt && task.createdAt && (
								<span>
									{t('createdAt')}: {new Date(task.createdAt).toLocaleDateString()}
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		)
	}
)
