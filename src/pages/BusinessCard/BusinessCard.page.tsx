export const BusinessCard: FC = () => {
	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="flex flex-col gap-2 w-[400px] h-auto border-4 rounded-xl p-2 relative">
				<p className="font-bold text-center">DATOS PARA FACTURA ELECTRÓNICA</p>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Nombre:</p>
					<span className="text-[18px] font-semibold">Avícola Gerardo RyR S.R.L</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Teléfono:</p>
					<span className="text-[18px] font-semibold">8835-1681</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Cédula:</p>
					<span className="text-[18px] font-semibold">3-102-906893</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Correo:</p>
					<span className="text-[18px] font-semibold">rovica64@gmail.com</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Dirección:</p>
					<span className="text-[18px] font-semibold">La Union de Venecia, San Carlos</span>
				</div>
				<img
					src="/assets/billing/hen.jpeg"
					alt="Logo"
					className="absolute w-22 h-22 right-2 bottom-[25%] z-[-1]"
				/>
			</div>
		</div>

		// <S.Container>
		// 	<S.Card>
		// 		<S.H3>DATOS PARA FACTURA ELECTRÓNICA</S.H3>
		// 		<S.DataContainer>
		// 			<S.H3>Nombre:</S.H3>
		// 			<span>Avícola Gerardo RyR S.R.L</span>
		// 		</S.DataContainer>
		// 		<S.DataContainer>
		// 			<S.H3>Teléfono:</S.H3>
		// 			<span>8835-1681</span>
		// 		</S.DataContainer>
		// 		<S.DataContainer>
		// 			<S.H3>Cédula Jurídica:</S.H3>
		// 			<span>3-102-906893</span>
		// 		</S.DataContainer>
		// 		<S.DataContainer>
		// 			<S.H3>Correo:</S.H3>
		// 			<span>rovica64@gmail.com</span>
		// 		</S.DataContainer>
		// 		<S.DataContainer>
		// 			<S.H3>Dirección:</S.H3>
		// 			<span>La Union de Venecia, San Carlos</span>
		// 		</S.DataContainer>
		// 		<S.Img src="/assets/billing/hen.jpeg" alt="Logo" />
		// 	</S.Card>
		// </S.Container>
	)
}
