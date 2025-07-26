export interface TaskColumnProps {
	status: TaskStatus
	title: string
	tasks: Task[]
	color: string
	bgColor: string
	onSearch?: (search: string) => void
}
