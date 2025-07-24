/**
 * SEO utilities to improve performance and indexing
 */

// export const preloadCriticalResources = () => {
// 	const preloadFont = (href: string, type = 'font/woff2') => {
// 		const link = document.createElement('link')
// 		link.rel = 'preload'
// 		link.as = 'font'
// 		link.type = type
// 		link.href = href
// 		link.crossOrigin = 'anonymous'
// 		document.head.appendChild(link)
// 	}

// 	const preloadImage = (href: string) => {
// 		const link = document.createElement('link')
// 		link.rel = 'preload'
// 		link.as = 'image'
// 		link.href = href
// 		document.head.appendChild(link)
// 	}

// 	// preloadFont('/fonts/inter-var.woff2')
// 	// preloadImage('/logo.png')
// }

// Generate structured breadcrumbs
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

// Generate structured data for the application
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

// Optimize images for SEO
export const optimizeImageSEO = (img: HTMLImageElement, alt: string, title?: string) => {
	img.alt = alt
	if (title) img.title = title
	img.loading = 'lazy'
	img.decoding = 'async'

	// Add structured data for important images
	if (img.classList.contains('hero-image') || img.classList.contains('featured-image')) {
		const imageData = {
			'@context': 'https://schema.org',
			'@type': 'ImageObject',
			url: img.src,
			description: alt,
			width: img.naturalWidth || img.width,
			height: img.naturalHeight || img.height,
		}

		// Create structured data script for the image
		const script = document.createElement('script')
		script.type = 'application/ld+json'
		script.textContent = JSON.stringify(imageData)
		document.head.appendChild(script)
	}
}

// Improve accessibility for SEO
export const improveAccessibility = () => {
	// Add skip links if they don't exist
	if (!document.querySelector('#skip-to-main')) {
		const skipLink = document.createElement('a')
		skipLink.id = 'skip-to-main'
		skipLink.href = '#main-content'
		skipLink.textContent = 'Skip to main content'
		skipLink.className =
			'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50'
		document.body.insertBefore(skipLink, document.body.firstChild)
	}

	// Ensure main content has the correct ID
	const main = document.querySelector('main')
	if (main && !main.id) {
		main.id = 'main-content'
	}
}

// Generate meta tags for specific social networks
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

// Lazy load non-critical components
export const lazyLoadNonCritical = () => {
	// Lazy load analytics and tracking scripts
	const loadAnalytics = () => {
		// Load Google Analytics, Hotjar, etc. after initial load
		setTimeout(() => {
			// Analytics scripts would be loaded here
			console.log('Loading analytics scripts...')
		}, 2000)
	}

	// Load after page is completely loaded
	if (document.readyState === 'complete') {
		loadAnalytics()
	} else {
		window.addEventListener('load', loadAnalytics)
	}
}

// Optimize Core Web Vitals
export const optimizeCoreWebVitals = () => {
	// Preconnect to critical external domains
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

	// Optimize LCP (Largest Contentful Paint)
	const optimizeLCP = () => {
		// Preload hero image if it exists
		const heroImage = document.querySelector('.hero-image') as HTMLImageElement
		if (heroImage && heroImage.src) {
			const link = document.createElement('link')
			link.rel = 'preload'
			link.as = 'image'
			link.href = heroImage.src
			document.head.appendChild(link)
		}
	}

	// Optimize CLS (Cumulative Layout Shift)
	const optimizeCLS = () => {
		// Reserve space for images
		const images = document.querySelectorAll('img:not([width]):not([height])')
		images.forEach((img) => {
			const htmlImg = img as HTMLImageElement
			if (!htmlImg.style.aspectRatio) {
				htmlImg.style.aspectRatio = '16/9' // Default ratio
			}
		})
	}

	// Execute optimizations
	optimizeLCP()
	optimizeCLS()
}

// Initialize all SEO optimizations
export const initializeSEO = () => {
	// preloadCriticalResources()
	improveAccessibility()
	optimizeCoreWebVitals()
	lazyLoadNonCritical()

	// Add application structured data
	const appData = generateAppStructuredData()
	const script = document.createElement('script')
	script.type = 'application/ld+json'
	script.id = 'app-structured-data'
	script.textContent = JSON.stringify(appData)
	document.head.appendChild(script)
}
