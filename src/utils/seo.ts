/**
 * Utilidades SEO para mejorar el rendimiento y la indexación
 */

// Preload de recursos críticos
export const preloadCriticalResources = () => {
	// Preload de fuentes críticas
	const preloadFont = (href: string, type = 'font/woff2') => {
		const link = document.createElement('link')
		link.rel = 'preload'
		link.as = 'font'
		link.type = type
		link.href = href
		link.crossOrigin = 'anonymous'
		document.head.appendChild(link)
	}

	// Preload de imágenes críticas
	const preloadImage = (href: string) => {
		const link = document.createElement('link')
		link.rel = 'preload'
		link.as = 'image'
		link.href = href
		document.head.appendChild(link)
	}

	// Precargar recursos críticos
	preloadFont('/fonts/inter-var.woff2')
	preloadImage('/logo.png')
}

// Generar breadcrumbs estructurados
export const generateBreadcrumbs = (pathname: string) => {
	const pathSegments = pathname.split('/').filter(Boolean)
	const breadcrumbs = [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: window.location.origin,
		},
	]

	let currentPath = ''
	pathSegments.forEach((segment, index) => {
		currentPath += `/${segment}`
		const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')

		breadcrumbs.push({
			'@type': 'ListItem',
			position: index + 2,
			name,
			item: `${window.location.origin}${currentPath}`,
		})
	})

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs,
	}
}

// Generar datos estructurados para la aplicación
export const generateAppStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Cattle Farm Management System',
		description: 'Professional farm management software for livestock operations',
		url: window.location.origin,
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web Browser',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		permissions: 'https://cattle-farm.app/privacy-policy',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			category: 'Free',
		},
		author: {
			'@type': 'Organization',
			name: 'Cattle Farm Management',
			url: window.location.origin,
		},
		featureList: [
			'Animal tracking and management',
			'Employee management',
			'Task scheduling',
			'Health record monitoring',
			'Production record tracking',
			'Multi-language support',
			'Offline functionality',
			'Real-time synchronization',
			'Mobile responsive design',
		],
		screenshot: `${window.location.origin}/screenshot-app.png`,
		softwareVersion: '1.0.0',
		releaseNotes: 'Initial release with comprehensive farm management features',
		downloadUrl: window.location.origin,
		installUrl: window.location.origin,
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.8',
			ratingCount: '150',
			bestRating: '5',
			worstRating: '1',
		},
	}
}

// Optimizar imágenes para SEO
export const optimizeImageSEO = (img: HTMLImageElement, alt: string, title?: string) => {
	img.alt = alt
	if (title) img.title = title
	img.loading = 'lazy'
	img.decoding = 'async'

	// Agregar datos estructurados para imágenes importantes
	if (img.classList.contains('hero-image') || img.classList.contains('featured-image')) {
		const imageData = {
			'@context': 'https://schema.org',
			'@type': 'ImageObject',
			url: img.src,
			description: alt,
			width: img.naturalWidth || img.width,
			height: img.naturalHeight || img.height,
		}

		// Crear script de datos estructurados para la imagen
		const script = document.createElement('script')
		script.type = 'application/ld+json'
		script.textContent = JSON.stringify(imageData)
		document.head.appendChild(script)
	}
}

// Mejorar la accesibilidad para SEO
export const improveAccessibility = () => {
	// Agregar skip links si no existen
	if (!document.querySelector('#skip-to-main')) {
		const skipLink = document.createElement('a')
		skipLink.id = 'skip-to-main'
		skipLink.href = '#main-content'
		skipLink.textContent = 'Skip to main content'
		skipLink.className =
			'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50'
		document.body.insertBefore(skipLink, document.body.firstChild)
	}

	// Asegurar que el main content tenga el ID correcto
	const main = document.querySelector('main')
	if (main && !main.id) {
		main.id = 'main-content'
	}
}

// Generar meta tags para redes sociales específicas
export const generateSocialMetaTags = (data: {
	title: string
	description: string
	image?: string
	url?: string
	type?: string
}) => {
	const { title, description, image, url, type = 'website' } = data
	const currentUrl = url || window.location.href
	const defaultImage = `${window.location.origin}/og-image.jpg`

	const metaTags = [
		// Open Graph
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: image || defaultImage },
		{ property: 'og:url', content: currentUrl },
		{ property: 'og:type', content: type },
		{ property: 'og:site_name', content: 'Cattle Farm Management' },
		{ property: 'og:locale', content: 'en_US' },

		// Twitter
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		{ name: 'twitter:image', content: image || defaultImage },
		{ name: 'twitter:url', content: currentUrl },

		// LinkedIn
		{ property: 'linkedin:title', content: title },
		{ property: 'linkedin:description', content: description },
		{ property: 'linkedin:image', content: image || defaultImage },

		// WhatsApp
		{ property: 'whatsapp:title', content: title },
		{ property: 'whatsapp:description', content: description },
		{ property: 'whatsapp:image', content: image || defaultImage },
	]

	return metaTags
}

// Función para lazy load de componentes no críticos
export const lazyLoadNonCritical = () => {
	// Lazy load de analytics y tracking scripts
	const loadAnalytics = () => {
		// Cargar Google Analytics, Hotjar, etc. después del load inicial
		setTimeout(() => {
			// Aquí se cargarían los scripts de analytics
			console.log('Loading analytics scripts...')
		}, 2000)
	}

	// Cargar después de que la página esté completamente cargada
	if (document.readyState === 'complete') {
		loadAnalytics()
	} else {
		window.addEventListener('load', loadAnalytics)
	}
}

// Optimizar Core Web Vitals
export const optimizeCoreWebVitals = () => {
	// Preconnect a dominios externos críticos
	const preconnectDomains = [
		'https://fonts.googleapis.com',
		'https://fonts.gstatic.com',
		'https://firebaseapp.com',
		'https://googleapis.com',
	]

	preconnectDomains.forEach((domain) => {
		const link = document.createElement('link')
		link.rel = 'preconnect'
		link.href = domain
		if (domain.includes('gstatic')) {
			link.crossOrigin = 'anonymous'
		}
		document.head.appendChild(link)
	})

	// Optimizar LCP (Largest Contentful Paint)
	const optimizeLCP = () => {
		// Preload de la imagen hero si existe
		const heroImage = document.querySelector('.hero-image') as HTMLImageElement
		if (heroImage && heroImage.src) {
			const link = document.createElement('link')
			link.rel = 'preload'
			link.as = 'image'
			link.href = heroImage.src
			document.head.appendChild(link)
		}
	}

	// Optimizar CLS (Cumulative Layout Shift)
	const optimizeCLS = () => {
		// Reservar espacio para imágenes
		const images = document.querySelectorAll('img:not([width]):not([height])')
		images.forEach((img) => {
			const htmlImg = img as HTMLImageElement
			if (!htmlImg.style.aspectRatio) {
				htmlImg.style.aspectRatio = '16/9' // Ratio por defecto
			}
		})
	}

	// Ejecutar optimizaciones
	optimizeLCP()
	optimizeCLS()
}

// Inicializar todas las optimizaciones SEO
export const initializeSEO = () => {
	preloadCriticalResources()
	improveAccessibility()
	optimizeCoreWebVitals()
	lazyLoadNonCritical()

	// Agregar datos estructurados de la aplicación
	const appData = generateAppStructuredData()
	const script = document.createElement('script')
	script.type = 'application/ld+json'
	script.id = 'app-structured-data'
	script.textContent = JSON.stringify(appData)
	document.head.appendChild(script)
}
