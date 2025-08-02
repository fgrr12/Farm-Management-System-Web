import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type FC, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaskModalProps } from './TaskModal.types'

export const TaskModal: FC<TaskModalProps> = memo(({ task, isOpen, onClose }) => {
	const { t } = useTranslation(['tasks'])
	const modalRef = useRef<HTMLDialogElement>(null)
	const backdropRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)

	const getPriorityIcon = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'i-material-symbols-keyboard-arrow-down'
			case 'medium':
				return 'i-material-symbols-remove'
			case 'high':
				return 'i-material-symbols-keyboard-arrow-up'
			default:
				return 'i-material-symbols-remove'
		}
	}, [])

	const getPriorityIconColor = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'bg-green-600! dark:bg-green-400!'
			case 'medium':
				return 'bg-yellow-600! dark:bg-yellow-400!'
			case 'high':
				return 'bg-red-600! dark:bg-red-400!'
			default:
				return 'bg-gray-600! dark:bg-gray-400!'
		}
	}, [])

	const getPriorityTextColor = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'text-green-600 dark:text-green-400'
			case 'medium':
				return 'text-yellow-600 dark:text-yellow-400'
			case 'high':
				return 'text-red-600 dark:text-red-400'
			default:
				return 'text-gray-700 dark:text-gray-300'
		}
	}, [])

	const getStatusIcon = useCallback((status: TaskStatus) => {
		switch (status) {
			case 'todo':
				return 'i-material-symbols-radio-button-unchecked'
			case 'in-progress':
				return 'i-material-symbols-hourglass-empty'
			case 'done':
				return 'i-material-symbols-check-circle'
			case 'archived':
				return 'i-material-symbols-archive'
			default:
				return 'i-material-symbols-radio-button-unchecked'
		}
	}, [])

	const getStatusIconColor = useCallback((status: TaskStatus) => {
		switch (status) {
			case 'todo':
				return 'bg-gray-500! dark:bg-gray-400!'
			case 'in-progress':
				return 'bg-blue-500! dark:bg-blue-400!'
			case 'done':
				return 'bg-green-500! dark:bg-green-400!'
			case 'archived':
				return 'bg-gray-400! dark:bg-gray-300!'
			default:
				return 'bg-gray-500! dark:bg-gray-400!'
		}
	}, [])

	const variantConfig = useMemo(() => {
		const configs = {
			todo: {
				headerBg: 'bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600',
				icon: 'i-material-symbols-task-alt',
			},
			'in-progress': {
				headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600',
				icon: 'i-material-symbols-task-alt',
			},
			done: {
				headerBg:
					'bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600',
				icon: 'i-material-symbols-task-alt',
			},
			archived: {
				headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500',
				icon: 'i-material-symbols-task-alt',
			},
		}
		return task ? configs[task.status] : configs.todo
	}, [task])

	const handleBackdropClick = useCallback(() => {
		onClose()
	}, [onClose])

	// GSAP animations
	useGSAP(() => {
		if (!modalRef.current || !backdropRef.current || !contentRef.current) return

		let timeline: gsap.core.Timeline | null = null

		if (isOpen) {
			// Entrance animation
			gsap.set(backdropRef.current, { opacity: 0, backdropFilter: 'blur(0px)' })
			gsap.set(contentRef.current, { scale: 0.9, opacity: 0, y: 30, rotationX: -10 })

			timeline = gsap.timeline()
			timeline.to(backdropRef.current, {
				opacity: 1,
				backdropFilter: 'blur(4px)',
				duration: 0.4,
				ease: 'power2.out',
			})
			timeline.to(
				contentRef.current,
				{
					scale: 1,
					opacity: 1,
					y: 0,
					rotationX: 0,
					duration: 0.5,
					ease: 'back.out(1.4)',
				},
				'-=0.2'
			)
		} else {
			// Exit animation
			if (backdropRef.current && contentRef.current) {
				timeline = gsap.timeline()
				timeline.to(contentRef.current, {
					scale: 0.9,
					opacity: 0,
					y: -20,
					rotationX: 10,
					duration: 0.3,
					ease: 'power2.in',
				})
				timeline.to(
					backdropRef.current,
					{
						opacity: 0,
						backdropFilter: 'blur(0px)',
						duration: 0.3,
						ease: 'power2.in',
					},
					'-=0.1'
				)
			}
		}

		return () => {
			if (timeline) {
				timeline.kill()
			}
			gsap.killTweensOf([backdropRef.current, contentRef.current])
		}
	}, [isOpen])

	useEffect(() => {
		if (!modalRef.current) return

		if (isOpen) {
			modalRef.current.showModal()
			document.body.style.overflow = 'hidden'
		} else {
			setTimeout(() => {
				modalRef.current?.close()
				document.body.style.overflow = 'unset'
			}, 400)
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!task) return null

	return (
		<dialog className="modal" ref={modalRef} aria-modal="true">
			<div
				role="dialog"
				ref={backdropRef}
				className="modal-backdrop bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300"
				onClick={handleBackdropClick}
			/>
			<div
				ref={contentRef}
				className="modal-box relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-0 p-0 overflow-hidden transition-all duration-300 max-w-2xl"
				style={{
					transform: 'translateZ(0)',
					willChange: 'transform, opacity',
				}}
			>
				{/* Header */}
				<div className={`${variantConfig.headerBg} px-6 py-4 text-white relative`}>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
							<i className={`${variantConfig.icon} w-5! h-5! bg-white!`} />
						</div>
						<h3 className="text-lg font-bold" id="modal-title">
							{t('taskDetails')}
						</h3>
					</div>

					{/* Close Button */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
						aria-label={t('close')}
					>
						<i className="i-material-symbols-close w-5! h-5! bg-white! transition-transform duration-200 hover:rotate-90" />
					</button>
				</div>

				{/* Content */}
				<div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
					{/* Status and Priority */}
					<div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div className="flex items-center gap-3">
							<div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
								<i
									className={`${getStatusIcon(task.status)} w-4! h-4! ${getStatusIconColor(task.status)}`}
								/>
							</div>
							<div>
								<span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
									{t('statusLabel', 'Status')}
								</span>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{t(`status.${task.status}`)}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
								<i
									className={`${getPriorityIcon(task.priority)} w-4! h-4! ${getPriorityIconColor(task.priority)}`}
								/>
							</div>
							<div className="text-right">
								<span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
									{t('priorityLabel', 'Priority')}
								</span>
								<span className={`text-sm font-medium ${getPriorityTextColor(task.priority)}`}>
									{t(`priority.${task.priority}`)}
								</span>
							</div>
						</div>
					</div>

					{/* Title */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
							{t('taskTitle', 'Title')}
						</h4>
						<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
							{task.title}
						</h3>
					</div>

					{/* Description */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
							{t('description')}
						</h4>
						<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
							<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
								{task.description}
							</p>
						</div>
					</div>

					{/* Timestamps */}
					{(task.createdAt || task.updatedAt) && (
						<div className="border-t border-gray-200 dark:border-gray-600 pt-6">
							<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
								{t('timestamps', 'Timestamps')}
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{task.createdAt && (
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
										<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
											{t('createdAt')}
										</span>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{new Date(task.createdAt).toLocaleString()}
										</span>
									</div>
								)}
								{task.updatedAt && (
									<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
										<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
											{t('updatedAt')}
										</span>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{new Date(task.updatedAt).toLocaleString()}
										</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</dialog>
	)
})

TaskModal.displayName = 'TaskModal'
