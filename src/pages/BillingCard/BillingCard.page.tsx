import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

const BillingCard: FC = () => {
	const { setHeaderTitle } = useAppStore()
	const { billingCard } = useFarmStore()
	const { t } = useTranslation('billingCard')

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])

	return (
		<div className="flex justify-center items-center w-full h-full">
			<div className="flex flex-col gap-2 w-[400px] h-auto border-4 rounded-xl p-2 relative bg-white shadow-lg text-black">
				<p className="font-bold text-center text-xl">{t('subtitle')}</p>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">{t('name')}</p>
					<span className="text-[18px] font-semibold">{billingCard!.name}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">{t('phone')}</p>
					<span className="text-[18px] font-semibold">{billingCard!.phone}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">{t('id')}</p>
					<span className="text-[18px] font-semibold">{billingCard!.id}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">{t('email')}</p>
					<span className="text-[18px] font-semibold">{billingCard!.email}</span>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<p className="text-[18px] font-bold">{t('address')}</p>
					<span className="text-[18px] font-semibold">{billingCard!.address}</span>
				</div>
				<img
					src="/assets/billing/hen.jpeg"
					alt="Logo"
					className="absolute w-22 h-22 right-2 bottom-[25%] z-[1]"
				/>
			</div>
		</div>
	)
}

export default BillingCard
