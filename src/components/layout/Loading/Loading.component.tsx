import { useRef, useEffect } from 'react'
import type { LoadingProps, LoadingRef } from './Loading.types'
import * as S from './Loading.styles'

export const Loading: FC<LoadingProps> = ({ open, ...rest }) => {
	const { loadingRef } = useLoading(open)

	return (
		<S.Loading ref={loadingRef} {...rest}>
			<S.Spinner />
		</S.Loading>
	)
}

const useLoading = (open?: boolean) => {
	const loadingRef: LoadingRef = useRef(null)

	useEffect(() => {
		if (!loadingRef.current) return
		open ? loadingRef.current.showModal() : loadingRef.current.close()
	}, [open])

	return { loadingRef }
}
