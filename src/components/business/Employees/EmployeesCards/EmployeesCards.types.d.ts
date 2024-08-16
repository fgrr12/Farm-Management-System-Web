export interface EmployeesCardsProps {
	employees: User[]
	user: User | null
	removeEmployee: (uuid: string) => void
}
