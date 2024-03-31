import type { PropsWithChildren, TableHTMLAttributes } from 'react'
import type { Body, Cell, Head, HeadCell, Row } from './Table.styles'

export type TableProps = PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>

export type TableElements = {
	Head: typeof Head
	Body: typeof Body
	Row: typeof Row
	HeadCell: typeof HeadCell
	Cell: typeof Cell
}
