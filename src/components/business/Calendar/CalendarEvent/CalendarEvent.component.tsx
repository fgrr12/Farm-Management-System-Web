import dayjs from 'dayjs'
import { memo } from 'react'

interface CalendarEventProps {
	event: CalendarEvent
	onClick?: (event: React.MouseEvent) => void
	compact?: boolean
}

export const CalendarEvent = memo<CalendarEventProps>(({ event, onClick, compact = false }) => {
	const getCategoryColor = (type: string) => {
		switch (type) {
			case 'medication':
				return 'bg-red-100 text-red-800 border-red-200'
			case 'vaccination':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'task':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'appointment':
				return 'bg-pink-100 text-pink-800 border-pink-200'
			case 'general':
				return 'bg-green-100 text-green-800 border-green-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getPriorityIcon = (priority: string) => {
		if (priority === 'high') {
			return <div className="i-heroicons-exclamation-triangle w-3 h-3 text-red-500" />
		}
		return null
	}

	const formatTime = (date: string) => {
		return dayjs(date).format('HH:mm')
	}

	if (compact) {
		return (
			<div
				role="button"
				tabIndex={0}
				className={`
					px-2 py-1 rounded text-xs cursor-pointer border
					hover:shadow-sm transition-all duration-200
					${getCategoryColor(event.type)}
				`}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						onClick?.(e as any)
					}
				}}
				title={`${event.title} - ${formatTime(event.date)}`}
			>
				<div className="flex items-center space-x-1">
					{getPriorityIcon(event.priority)}
					<span className="truncate flex-1">{event.title}</span>
					{event.time && <div className="i-heroicons-clock w-3 h-3 opacity-60" />}
				</div>
			</div>
		)
	}

	return (
		<div
			role="button"
			tabIndex={0}
			className={`
				p-3 rounded-lg cursor-pointer border-l-4 shadow-sm
				hover:shadow-md transition-all duration-200
				${getCategoryColor(event.type)}
			`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick?.(e as any)
				}
			}}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center space-x-2 mb-1">
						{getPriorityIcon(event.priority)}
						<h4 className="font-medium text-sm">{event.title}</h4>
					</div>

					{event.description && (
						<p className="text-xs opacity-80 mb-2 line-clamp-2">{event.description}</p>
					)}

					<div className="flex items-center space-x-3 text-xs opacity-70">
						{event.time && (
							<div className="flex items-center space-x-1">
								<div className="i-heroicons-clock w-3 h-3" />
								<span>{formatTime(event.date)}</span>
							</div>
						)}

						{event.animalId && (
							<span className="bg-white/50 px-2 py-1 rounded">{event.animalId}</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
})
