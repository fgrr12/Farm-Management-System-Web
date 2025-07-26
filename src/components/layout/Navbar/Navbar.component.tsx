import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { UserService } from '@/services/user'

import { BackButton } from '@/components/ui/Button'

import { useBackRoute } from '@/hooks/ui/useBackRoute'

export const Navbar = memo(() => {
	const drawerRef = useRef<HTMLInputElement>(null)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const drawerTitleRef = useRef<HTMLHeadingElement>(null)
	const { user, setUser } = useUserStore()
	const { farm, billingCard, setFarm } = useFarmStore()
	const { t } = useTranslation('common')
	const navigate = useNavigate()
	const location = useLocation()
	const { headerTitle, loading } = useAppStore()
	const backRoute = useBackRoute()

	const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light')

	const backButtonHidden = useMemo(
		() =>
			location.pathname === AppRoutes.ANIMALS ||
			location.pathname === AppRoutes.EMPLOYEES ||
			location.pathname === AppRoutes.TASKS ||
			location.pathname === AppRoutes.MY_ACCOUNT ||
			location.pathname === AppRoutes.MY_SPECIES ||
			location.pathname === AppRoutes.BILLING_CARD ||
			location.pathname === AppRoutes.DASHBOARD,
		[location.pathname]
	)

	const handleBack = useCallback(() => {
		navigate(backRoute as string)
	}, [navigate, backRoute])

	const closeDrawer = useCallback(() => {
		if (drawerRef.current) drawerRef.current.checked = false
	}, [])

	const goTo = useCallback(
		(path: string) => () => {
			navigate(path)
			closeDrawer()
		},
		[navigate, closeDrawer]
	)

	const handleLogout = useCallback(async () => {
		if (!user) return
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}, [user, setUser, setFarm, navigate])

	useEffect(() => {
		localStorage.setItem('theme', theme)
		document.querySelector('html')!.setAttribute('data-theme', theme)
	}, [theme])

	useGSAP(() => {
		const el = titleRef.current
		if (!el || loading || !headerTitle.trim()) return

		const split = new SplitText(el, { type: 'chars' })

		gsap.from(split.chars, {
			autoAlpha: 0,
			x: 10,
			duration: 1,
			stagger: 0.05,
			ease: 'power1.out',
		})

		return () => {
			split.revert()
		}
	}, [headerTitle, loading])

	useGSAP(() => {
		const drawer = drawerRef.current
		if (!drawer || !drawerTitleRef.current || !farm) return

		const handleChange = () => {
			if (drawer.checked && drawerTitleRef.current) {
				const split = new SplitText(drawerTitleRef.current, { type: 'chars' })
				gsap.from(split.chars, {
					autoAlpha: 0,
					x: 10,
					duration: 1,
					stagger: 0.05,
					ease: 'power1.out',
				})
				return () => {
					setTimeout(() => split.revert(), 2000)
				}
			}
		}

		drawer.addEventListener('change', handleChange)

		return () => {
			drawer.removeEventListener('change', handleChange)
		}
	}, [farm])
	return (
		<div className="drawer">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" ref={drawerRef} />
			<div className="drawer-content">
				<div className="navbar bg-base-100 shadow-sm">
					<div className="navbar-start">
						<div className="dropdown">
							<label
								htmlFor="my-drawer"
								className="btn btn-ghost btn-circle"
								aria-label="Open menu"
							>
								<i className="i-flowbite-bars-from-left-outline w-8! h-8!" />
							</label>
							{!backButtonHidden && (
								<BackButton disabled={!user} onClick={handleBack}>
									{t('header.return')}
								</BackButton>
							)}
						</div>
					</div>
					<div className="navbar-center">
						<h2 ref={titleRef} className="text-2xl font-bold">
							{headerTitle}
						</h2>
					</div>
					<div className="navbar-end">
						<button type="button" className="btn btn-ghost btn-circle" aria-label="Notifications">
							<div className="indicator">
								<i className="i-material-symbols-notifications-outline-sharp w-6! h-6!" />
								<span className="badge badge-xs badge-primary indicator-item animate-pulse" />
							</div>
						</button>
					</div>
				</div>
			</div>
			<div className="drawer-side z-10">
				<label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay" />
				<ul
					className="menu bg-base-200 text-base-content min-h-full w-80 p-4"
					role="navigation"
					aria-label="Main navigation"
				>
					{farm && (
						<h2 ref={drawerTitleRef} className="text-xl font-bold mb-2 text-center">
							{farm!.name}
						</h2>
					)}
					<li className={location.pathname.includes(AppRoutes.ANIMALS) ? 'bg-info rounded-sm' : ''}>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={goTo(AppRoutes.ANIMALS)}
						>
							<i className="i-healthicons-animal-cow w-8! h-8!" />
							<span className="text-sm">{t('sidebar.animals')}</span>
						</button>
					</li>
					<li className={location.pathname.includes(AppRoutes.TASKS) ? 'bg-info rounded-sm' : ''}>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={goTo(AppRoutes.TASKS)}
						>
							<i className="i-fluent-tasks-app-24-filled w-8! h-8!" />
							<span className="text-sm">{t('sidebar.tasks')}</span>
						</button>
					</li>
					<li
						className={location.pathname.includes(AppRoutes.MY_SPECIES) ? 'bg-info rounded-sm' : ''}
					>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={goTo(AppRoutes.MY_SPECIES)}
						>
							<i className="i-solar-dna-bold-duotone w-8! h-8!" />
							<span className="text-sm">{t('sidebar.mySpecies')}</span>
						</button>
					</li>
					{(user?.role === 'admin' || user?.role === 'owner') && <div className="divider" />}
					{(user?.role === 'admin' || user?.role === 'owner') && (
						<li
							className={
								location.pathname.includes(AppRoutes.EMPLOYEES) ? 'bg-info rounded-sm' : ''
							}
						>
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2 selection:bg-red"
								onClick={goTo(AppRoutes.EMPLOYEES)}
							>
								<i className="i-clarity-employee-group-solid w-8! h-8!" />
								<span className="text-sm">{t('sidebar.employees')}</span>
							</button>
						</li>
					)}
					{(user?.role === 'admin' || user?.role === 'owner') &&
						billingCard !== null &&
						billingCard.status && (
							<li
								className={
									location.pathname.includes(AppRoutes.BILLING_CARD) ? 'bg-info rounded-sm' : ''
								}
							>
								<button
									type="button"
									className="flex items-center gap-2 px-4 py-2"
									onClick={goTo(AppRoutes.BILLING_CARD)}
								>
									<i className="i-typcn-business-card w-8! h-8!" />
									<span className="text-sm">{t('sidebar.businessCard')}</span>
								</button>
							</li>
						)}
					<div className="divider" />
					<li
						className={location.pathname.includes(AppRoutes.MY_ACCOUNT) ? 'bg-info rounded-sm' : ''}
					>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={goTo(AppRoutes.MY_ACCOUNT)}
						>
							<i className="i-material-symbols-account-circle w-8! h-8!" />
							<span className="text-sm">{t('sidebar.myAccount')}</span>
						</button>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={handleLogout}
						>
							<i className="i-material-symbols-logout w-8! h-8!" />
							<span className="text-sm">{t('sidebar.logout')}</span>
						</button>
					</li>
					<div className="divider" />
					<li>
						<label className="swap swap-rotate" aria-label="Toggle theme">
							<input
								type="checkbox"
								className="theme-controller"
								value="synthwave"
								onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
							/>
							<i className="i-line-md-moon-alt-to-sunny-outline-loop-transition swap-off h-8! w-8! fill-current" />
							<i className="i-line-md-sunny-outline-to-moon-alt-loop-transition swap-on h-8! w-8! fill-current" />
						</label>
					</li>
				</ul>
			</div>
		</div>
	)
})
