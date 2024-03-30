import type { PropsWithChildren, TableHTMLAttributes } from 'react'
import type { Head, Body, Row, HeadCell, Cell } from './Table.styles'

export type TableProps = PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>

export type TableElements = {
	Head: typeof Head
	Body: typeof Body
	Row: typeof Row
	HeadCell: typeof HeadCell
	Cell: typeof Cell
}
