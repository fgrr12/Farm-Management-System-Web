import type { User } from '@/types'

export interface EmployeesTableProps {
	employees: User[]
	removeEmployee: (uuid: string) => void
}
