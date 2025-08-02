export interface TaskCardProps {
	task: Task
	draggable?: boolean
	onTaskClick?: (task: Task) => void
}
