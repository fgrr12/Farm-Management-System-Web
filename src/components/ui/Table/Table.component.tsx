import * as S from './Table.styles'
import type { TableElements, TableProps } from './Table.types'

const Table: FC<TableProps> & TableElements = ({ children }) => {
	return <S.Table>{children}</S.Table>
}

Table.Head = S.Head
Table.Body = S.Body
Table.Row = S.Row
Table.HeadCell = S.HeadCell
Table.Cell = S.Cell

export { Table }
