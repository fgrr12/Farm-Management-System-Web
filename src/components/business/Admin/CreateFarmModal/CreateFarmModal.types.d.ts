export interface CreateFarmModalProps {
	isOpen: boolean
	onClose: () => void
	onFarmCreated: (farm: Farm) => void
}
