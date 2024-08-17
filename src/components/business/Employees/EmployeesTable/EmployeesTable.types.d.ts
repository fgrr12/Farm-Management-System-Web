export interface EmployeesTableProps {
	employees: User[]
	removeEmployee: (uuid: string) => void
}
