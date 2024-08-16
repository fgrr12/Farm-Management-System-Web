export interface EmployeesTableProps {
	employees: User[]
	user: User | null
	removeEmployee: (uuid: string) => void
}
