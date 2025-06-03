import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ToastProps } from './Toast.types'

export const Toast = ({ id, message, type = 'info', duration = 4000, onClose }: ToastProps) => {
    const toastRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useLayoutEffect(() => {
        const el = toastRef.current
        if (!el) return

        gsap.fromTo(
            el,
            { x: 200, opacity: 0, scale: 0.6 },
            {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'power3.out',
            }
        )

        timeoutRef.current = setTimeout(() => {
            gsap.to(el, {
                x: 200,
                opacity: 0,
                scale: 0.6,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => onClose(id),
            })
        }, duration)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div
            ref={toastRef}
            className={`alert alert-${type} shadow-lg transition-all w-full max-w-[90%] sm:max-w-100`}
        >
            <span>{message}</span>
        </div>
    )
}
