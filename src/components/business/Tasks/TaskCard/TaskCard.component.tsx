import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaskCardProps } from './TaskCard.types'

export const TaskCard: FC<TaskCardProps> = memo(({ task, draggable: isDraggable = false }) => {
	const { t } = useTranslation(['tasks'])
	const ref = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)

	const getPriorityColor = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'bg-green-500'
			case 'medium':
				return 'bg-yellow-500'
			case 'high':
				return 'bg-red-500'
			default:
				return 'bg-gray-500'
		}
	}, [])

	const getPriorityIcon = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'i-material-symbols-keyboard-arrow-down bg-green-600!'
			case 'medium':
				return 'i-material-symbols-remove bg-yellow-600!'
			case 'high':
				return 'i-material-symbols-keyboard-arrow-up bg-red-600!'
			default:
				return 'i-material-symbols-remove bg-gray-600!'
		}
	}, [])

	const getStatusIcon = useCallback((status: TaskStatus) => {
		switch (status) {
			case 'todo':
				return 'i-material-symbols-radio-button-unchecked bg-gray-500!'
			case 'in-progress':
				return 'i-material-symbols-hourglass-empty bg-blue-500!'
			case 'done':
				return 'i-material-symbols-check-circle bg-green-500!'
			case 'archived':
				return 'i-material-symbols-archive bg-gray-400!'
			default:
				return 'i-material-symbols-radio-button-unchecked bg-gray-500!'
		}
	}, [])

	// GSAP animations
	useGSAP(() => {
		if (ref.current) {
			gsap.fromTo(
				ref.current,
				{ y: 20, opacity: 0, scale: 0.95 },
				{ y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
			)
		}
	}, [])

	const handleMouseEnter = useCallback(() => {
		if (ref.current && !dragging) {
			gsap.to(ref.current, {
				y: -4,
				duration: 0.2,
				ease: 'power1.out',
			})
		}
	}, [dragging])

	const handleMouseLeave = useCallback(() => {
		if (ref.current && !dragging) {
			gsap.to(ref.current, {
				y: 0,
				duration: 0.2,
				ease: 'power1.out',
			})
		}
	}, [dragging])

	useEffect(() => {
		const el = ref.current
		if (!el || !isDraggable) return

		return draggable({
			element: el,
			getInitialData: () => ({
				taskId: task.uuid,
				currentStatus: task.status,
				type: 'task',
			}),
			onDragStart: () => {
				setDragging(true)
				if (el) {
					gsap.to(el, { scale: 1.03, rotation: 3, duration: 0.2, ease: 'power1.out' })
				}
			},
			onDrop: () => {
				setDragging(false)
				if (el) {
					gsap.to(el, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
				}
			},
		})
	}, [isDraggable, task.uuid, task.status])

	return (
		<div
			ref={ref}
			className={`
				card bg-white w-full shadow-sm border border-gray-200 rounded-xl overflow-hidden
				transition-all duration-200 hover:shadow-xl hover:border-gray-300
				${isDraggable ? 'cursor-grab' : ''}
				${dragging ? 'opacity-90 shadow-2xl z-10 ring-2 ring-blue-300' : ''}
			`}
			role="article"
			aria-labelledby={`task-${task.uuid}-title`}
			aria-describedby={`task-${task.uuid}-description`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				transform: 'translateZ(0)', // Force hardware acceleration
				willChange: 'transform, opacity', // Optimize for animations
			}}
		>
			<div className="card-body p-4">
				{/* Header with status and priority */}
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<div className={`w-4 h-4 ${getStatusIcon(task.status)}`} />
						<span className="text-xs text-gray-500 uppercase tracking-wide">
							{t(`status.${task.status}`)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<div className={`w-4 h-4 ${getPriorityIcon(task.priority)}`} />
						<span className="text-xs text-gray-500">{t(`priority.${task.priority}`)}</span>
					</div>
				</div>

				{/* Task content */}
				<div className="flex-1">
					<h3
						id={`task-${task.uuid}-title`}
						className="font-semibold text-gray-900 mb-2 line-clamp-2"
					>
						{task.title}
					</h3>
					<p id={`task-${task.uuid}-description`} className="text-sm text-gray-600 line-clamp-3">
						{task.description}
					</p>
				</div>

				{/* Priority indicator bar with gradient */}
				<div className="mt-3">
					<div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-300 ${getPriorityColor(task.priority)}`}
							style={{
								background:
									task.priority === 'high'
										? 'linear-gradient(90deg, #ef4444, #dc2626)'
										: task.priority === 'medium'
											? 'linear-gradient(90deg, #eab308, #ca8a04)'
											: 'linear-gradient(90deg, #22c55e, #16a34a)',
							}}
						/>
					</div>
				</div>

				{/* Timestamps */}
				{(task.createdAt || task.updatedAt) && (
					<div className="mt-2 text-xs text-gray-400">
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
})
