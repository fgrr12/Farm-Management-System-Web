import { useEffect, useRef } from 'react'
import * as S from './Loading.styles'
import type { LoadingProps, LoadingRef } from './Loading.types'

export const Loading: FC<LoadingProps> = ({ open, ...rest }) => {
	const { loadingRef } = useLoading(open)

	return (
		<S.Loading ref={loadingRef} {...rest}>
			<S.TextContainer>
				<S.Letter>Loading</S.Letter>
				<S.Dot>.</S.Dot>
				<S.Dot>.</S.Dot>
				<S.Dot>.</S.Dot>
			</S.TextContainer>
			<S.XSpinner>
				<S.Icon className="i-fluent-emoji-flat-cow" />
				<S.Icon className="i-emojione-chicken" />
				<S.Icon className="i-fxemoji-sheep" />
				<S.Icon className="i-emojione-goat" />
			</S.XSpinner>
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
