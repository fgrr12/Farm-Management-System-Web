import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { EmployeesService } from '@/services/employees'
import { TasksService } from '@/services/tasks'

import type { TaskModalProps } from './TaskModal.types'

export const TaskModal: FC<TaskModalProps> = memo(({ task, isOpen, onClose }) => {
	const { t } = useTranslation(['tasks'])
	const modalRef = useRef<HTMLDialogElement>(null)
	const backdropRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const [assignedUser, setAssignedUser] = useState<User | null>(null)
	const [availableEmployees, setAvailableEmployees] = useState<User[]>([])
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Get stores
	const { farm } = useFarmStore()
	const { user } = useUserStore()

	const getPriorityIcon = useCallback((priority: TaskPriority) => {
		switch (priority) {
			case 'low':
				return 'i-material-symbols-keyboard-arrow-down'
			case 'medium':
				return 'i-material-symbols-remove'
			case 'high':
				return 'i-material-symbols-keyboard-arrow-up'
			case 'critical':
				return 'i-material-symbols-warning'
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
			case 'critical':
				return 'bg-red-700! dark:bg-red-500!'
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
			case 'critical':
				return 'text-red-700 dark:text-red-400 font-bold animate-pulse'
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
			case 'overdue':
				return 'bg-red-500! dark:bg-red-400!'
			default:
				return 'bg-gray-500! dark:bg-gray-400!'
		}
	}, [])

	const variantConfig = useMemo(() => {
		const configs = {
			todo: {
				headerBg: 'bg-linear-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600',
				icon: 'i-material-symbols-task-alt',
			},
			'in-progress': {
				headerBg: 'bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600',
				icon: 'i-material-symbols-task-alt',
			},
			done: {
				headerBg:
					'bg-linear-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600',
				icon: 'i-material-symbols-task-alt',
			},
			archived: {
				headerBg: 'bg-linear-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500',
				icon: 'i-material-symbols-task-alt',
			},
			overdue: {
				headerBg: 'bg-linear-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600',
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

	// Fetch assigned user details
	useEffect(() => {
		if (task?.assignedTo) {
			EmployeesService.getEmployee(task.assignedTo)
				.then(setAssignedUser)
				.catch(() => setAssignedUser(null))
		} else {
			setAssignedUser(null)
		}
	}, [task?.assignedTo])

	// Load available employees for assignment
	useEffect(() => {
		if (farm?.uuid) {
			EmployeesService.getEmployees(farm.uuid)
				.then(setAvailableEmployees)
				.catch(() => setAvailableEmployees([]))
		}
	}, [farm?.uuid])

	// Handle user assignment change
	const handleAssignmentChange = useCallback(
		async (employeeUuid: string) => {
			if (!task || !user?.uuid || !farm?.uuid) return

			try {
				const updatedTask = { ...task, assignedTo: employeeUuid || undefined }
				await TasksService.updateTask(updatedTask, user.uuid, farm.uuid)
				// Update local state
				if (employeeUuid) {
					const employee = availableEmployees.find((emp) => emp.uuid === employeeUuid)
					setAssignedUser(employee || null)
				} else {
					setAssignedUser(null)
				}
				// Close dropdown
				setIsDropdownOpen(false)
			} catch (error) {
				console.error('Error updating task assignment:', error)
			}
		},
		[task, user?.uuid, farm?.uuid, availableEmployees]
	)

	// Handle dropdown toggle
	const handleDropdownToggle = useCallback(() => {
		setIsDropdownOpen((prev) => !prev)
	}, [])

	// Handle click outside dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isDropdownOpen])

	// Function to get user initials for avatar
	const getUserInitials = useCallback((user: User) => {
		const names = [user.name, user.lastName].filter(Boolean)
		return names.map((name) => name.charAt(0).toUpperCase()).join('')
	}, [])

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

					{/* Assignment and Due Date */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
							{t('taskDetails', 'Task Details')}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* User Assignment Selector */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
								<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
									{t('assignedTo', 'Assigned To')}
								</span>

								{/* Custom Dropdown */}
								<div className="relative" ref={dropdownRef}>
									{/* Dropdown Trigger */}
									<button
										type="button"
										onClick={handleDropdownToggle}
										className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{assignedUser ? (
													<>
														{assignedUser.photoUrl ? (
															<img
																src={assignedUser.photoUrl}
																alt={`${assignedUser.name} ${assignedUser.lastName}`}
																className="w-8 h-8 rounded-full object-cover"
															/>
														) : (
															<div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
																{getUserInitials(assignedUser)}
															</div>
														)}
														<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
															{assignedUser.name} {assignedUser.lastName}
														</div>
													</>
												) : (
													<>
														<div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center">
															<i className="i-material-symbols-person w-4! h-4!" />
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{t('unassigned', 'Unassigned')}
														</div>
													</>
												)}
											</div>
											<i
												className={`i-material-symbols-expand-more w-5! h-5! text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
											/>
										</div>
									</button>

									{/* Dropdown Options */}
									{isDropdownOpen && (
										<div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
											{/* Unassigned Option */}
											<button
												type="button"
												onClick={() => handleAssignmentChange('')}
												className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center">
														<i className="i-material-symbols-person w-4! h-4!" />
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														{t('unassigned', 'Unassigned')}
													</div>
												</div>
											</button>

											{/* Employee Options */}
											{availableEmployees.map((employee) => (
												<button
													key={employee.uuid}
													type="button"
													onClick={() => handleAssignmentChange(employee.uuid)}
													className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
												>
													<div className="flex items-center gap-3">
														{employee.photoUrl ? (
															<img
																src={employee.photoUrl}
																alt={`${employee.name} ${employee.lastName}`}
																className="w-8 h-8 rounded-full object-cover"
															/>
														) : (
															<div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
																{getUserInitials(employee)}
															</div>
														)}
														<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
															{employee.name} {employee.lastName}
														</div>
													</div>
												</button>
											))}
										</div>
									)}
								</div>
							</div>

							{task.dueDate && (
								<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
									<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
										{t('dueDate', 'Due Date')}
									</span>
									<span className="text-sm text-gray-700 dark:text-gray-300">
										{new Date(task.dueDate).toLocaleDateString()}
									</span>
								</div>
							)}
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
