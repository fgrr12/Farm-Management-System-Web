import { useEffect } from 'react'

export interface PageMetaOptions {
	title: string
	description?: string
	keywords?: string[]
	ogImage?: string
}

/**
 * Hook to dynamically update page meta tags for better SEO
 * Updates document title, meta description, Open Graph tags, and Twitter cards
 */
export const usePageMeta = ({ title, description, keywords, ogImage }: PageMetaOptions) => {
	useEffect(() => {
		// Update document title
		const fullTitle = `${title} | Cattle Farm Management`
		document.title = fullTitle

		// Update or create meta description
		if (description) {
			let metaDesc = document.querySelector('meta[name="description"]')
			if (!metaDesc) {
				metaDesc = document.createElement('meta')
				metaDesc.setAttribute('name', 'description')
				document.head.appendChild(metaDesc)
			}
			metaDesc.setAttribute('content', description)
		}

		// Update or create meta keywords
		if (keywords && keywords.length > 0) {
			let metaKeywords = document.querySelector('meta[name="keywords"]')
			if (!metaKeywords) {
				metaKeywords = document.createElement('meta')
				metaKeywords.setAttribute('name', 'keywords')
				document.head.appendChild(metaKeywords)
			}
			metaKeywords.setAttribute('content', keywords.join(', '))
		}

		// Update Open Graph title
		const ogTitle = document.querySelector('meta[property="og:title"]')
		if (ogTitle) {
			ogTitle.setAttribute('content', fullTitle)
		}

		// Update Open Graph description
		if (description) {
			const ogDesc = document.querySelector('meta[property="og:description"]')
			if (ogDesc) {
				ogDesc.setAttribute('content', description)
			}
		}

		// Update Open Graph image
		if (ogImage) {
			const ogImg = document.querySelector('meta[property="og:image"]')
			if (ogImg) {
				ogImg.setAttribute('content', ogImage)
			}
		}

		// Update Twitter card title
		const twitterTitle = document.querySelector('meta[property="twitter:title"]')
		if (twitterTitle) {
			twitterTitle.setAttribute('content', fullTitle)
		}

		// Update Twitter card description
		if (description) {
			const twitterDesc = document.querySelector('meta[property="twitter:description"]')
			if (twitterDesc) {
				twitterDesc.setAttribute('content', description)
			}
		}

		// Update Twitter card image
		if (ogImage) {
			const twitterImg = document.querySelector('meta[property="twitter:image"]')
			if (twitterImg) {
				twitterImg.setAttribute('content', ogImage)
			}
		}
	}, [title, description, keywords, ogImage])
}
