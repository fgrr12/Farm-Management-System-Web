import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'

import type { ContainerProps } from './CardContainer.types'

export const CardContainer: FC<ContainerProps> = ({ title, location, children, ...props }) => {
	const ref: any = useRef(null)
	const [isDraggedOver, setIsDraggedOver] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) {
			throw new Error('Expected "el" to be defined')
		}

		return dropTargetForElements({
			element: el,
			getData: () => ({ location }),
			onDragEnter: () => setIsDraggedOver(true),
			onDragLeave: () => setIsDraggedOver(false),
			onDrop: () => setIsDraggedOver(false),
		})
	}, [location])
	return (
		<div
			className={`w-auto p-4 space-y-2 rounded-lg shadow-lg ${isDraggedOver && 'bg-info'}`}
			ref={ref}
			{...props}
		>
			<div className="flex items-center justify-between mb-4">
				<span className="text-md font-semibold text-xl">{title}</span>
			</div>
			<div className="flex flex-col items-center gap-2 overflow-auto pb-2 h-[95%]">{children}</div>
		</div>
	)
}
