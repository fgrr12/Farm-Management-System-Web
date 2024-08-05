import * as S from './BillingCard.styles'

export const BillingCard: FC = () => {
	return (
		<S.Container>
			<S.Card>
				<S.H3>DATOS PARA FACTURA ELECTRÓNICA</S.H3>
				<S.DataContainer>
					<S.H3>Nombre:</S.H3>
					<label>Avícola Gerardo RyR S.R.L</label>
				</S.DataContainer>
				<S.DataContainer>
					<S.H3>Teléfono:</S.H3>
					<label>8835-1681</label>
				</S.DataContainer>
				<S.DataContainer>
					<S.H3>Cédula Jurídica:</S.H3>
					<label>3-102-906893</label>
				</S.DataContainer>
				<S.DataContainer>
					<S.H3>Correo:</S.H3>
					<label>rovica64@gmail.com</label>
				</S.DataContainer>
				<S.DataContainer>
					<S.H3>Dirección:</S.H3>
					<label>La Union de Venecia, San Carlos</label>
				</S.DataContainer>
				<S.Img src="/assets/billing/hen.jpeg" alt="Logo" />
			</S.Card>
		</S.Container>
	)
}
