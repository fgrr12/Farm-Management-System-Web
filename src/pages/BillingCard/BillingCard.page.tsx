import { useFarmStore } from '@/store/useFarmStore'

export const BillingCard: FC = () => {
	const { farm } = useFarmStore()
	const { billingCard } = farm!
	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="flex flex-col gap-2 w-[400px] h-auto border-4 rounded-xl p-2 relative">
				<p className="font-bold text-center">DATOS PARA FACTURA ELECTRÓNICA</p>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Nombre:</p>
					<span className="text-[18px] font-semibold">{billingCard!.name}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Teléfono:</p>
					<span className="text-[18px] font-semibold">{billingCard!.phone}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Cédula:</p>
					<span className="text-[18px] font-semibold">{billingCard!.id}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Correo:</p>
					<span className="text-[18px] font-semibold">{billingCard!.email}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">Dirección:</p>
					<span className="text-[18px] font-semibold">{billingCard!.address}</span>
				</div>
				<img
					src="/assets/billing/hen.jpeg"
					alt="Logo"
					className="absolute w-22 h-22 right-2 bottom-[25%] z-[-1]"
				/>
			</div>
		</div>
	)
}
