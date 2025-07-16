import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
    title?: string
    description?: string
    keywords?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
    noIndex?: boolean
}

interface PageSEOConfig {
    title: string
    description: string
    keywords: string
}

// Configuración SEO por página
const PAGE_SEO_CONFIG: Record<string, PageSEOConfig> = {
    '/': {
        title: 'Dashboard - Cattle Farm Management System',
        description: 'Access your farm dashboard to view animal statistics, recent activities, and manage your livestock operations efficiently.',
        keywords: 'farm dashboard, livestock overview, cattle statistics, farm management dashboard',
    },
    '/animals': {
        title: 'Animal Management - Track Your Livestock',
        description: 'Manage your livestock inventory, track animal health, breeding records, and monitor your cattle with our comprehensive animal management system.',
        keywords: 'animal management, livestock tracking, cattle inventory, animal health records, breeding management',
    },
    '/animals/add': {
        title: 'Add New Animal - Register Livestock',
        description: 'Register new animals in your farm management system. Add cattle details, health information, and breeding records.',
        keywords: 'add animal, register cattle, new livestock, animal registration, cattle entry',
    },
    '/animals/edit': {
        title: 'Edit Animal Information - Update Livestock Records',
        description: 'Update animal information, health records, and breeding data in your farm management system.',
        keywords: 'edit animal, update livestock, modify cattle records, animal information update',
    },
    '/animal': {
        title: 'Animal Details - Individual Livestock Information',
        description: 'View detailed information about individual animals including health records, breeding history, and production data.',
        keywords: 'animal details, livestock information, cattle profile, individual animal records',
    },
    '/employees': {
        title: 'Employee Management - Farm Staff Administration',
        description: 'Manage your farm employees, assign roles, track responsibilities, and organize your agricultural workforce.',
        keywords: 'employee management, farm staff, agricultural workers, workforce management, farm employees',
    },
    '/employees/add': {
        title: 'Add Employee - Register Farm Staff',
        description: 'Add new employees to your farm management system. Register staff members and assign roles and responsibilities.',
        keywords: 'add employee, register staff, new farm worker, employee registration, farm staff entry',
    },
    '/employees/edit': {
        title: 'Edit Employee Information - Update Staff Records',
        description: 'Update employee information, roles, and responsibilities in your farm management system.',
        keywords: 'edit employee, update staff, modify worker records, employee information update',
    },
    '/tasks': {
        title: 'Task Management - Farm Activity Scheduling',
        description: 'Schedule and manage farm tasks, track completion status, and organize daily agricultural activities.',
        keywords: 'task management, farm scheduling, agricultural tasks, farm activities, task tracking',
    },
    '/tasks/add': {
        title: 'Create Task - Schedule Farm Activity',
        description: 'Create new farm tasks, set schedules, assign responsibilities, and organize agricultural activities.',
        keywords: 'create task, schedule activity, new farm task, task creation, farm scheduling',
    },
    '/my-account': {
        title: 'My Account - User Profile Settings',
        description: 'Manage your account settings, update profile information, and configure your farm management preferences.',
        keywords: 'user account, profile settings, account management, user preferences, profile update',
    },
    '/my-species': {
        title: 'Species Management - Livestock Categories',
        description: 'Manage livestock species and breeds in your farm. Configure animal categories and breeding information.',
        keywords: 'species management, livestock breeds, animal categories, breed management, cattle species',
    },
    '/billing-card': {
        title: 'Billing Information - Payment Management',
        description: 'Manage your billing information, payment methods, and subscription details for the farm management system.',
        keywords: 'billing information, payment management, subscription, farm software billing, payment methods',
    },
    '/login': {
        title: 'Login - Access Your Farm Management System',
        description: 'Sign in to your cattle farm management system to access livestock tracking, employee management, and farm operations.',
        keywords: 'login, sign in, farm access, user authentication, farm management login',
    },
}

export const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    noIndex = false,
}: SEOProps) => {
    const location = useLocation()

    useEffect(() => {
        // Obtener configuración SEO de la página actual
        const pageConfig = PAGE_SEO_CONFIG[location.pathname]

        // Usar props personalizados o configuración de página por defecto
        const finalTitle = title || pageConfig?.title || 'Cattle Farm Management System'
        const finalDescription = description || pageConfig?.description || 'Professional farm management software for livestock operations'
        const finalKeywords = keywords || pageConfig?.keywords || 'farm management, livestock, cattle'
        const finalUrl = url || `${window.location.origin}${location.pathname}`
        const finalImage = image || `${window.location.origin}/og-image.jpg`

        // Actualizar título de la página
        document.title = finalTitle

        // Función para actualizar o crear meta tag
        const updateMetaTag = (selector: string, content: string) => {
            let element = document.querySelector(selector) as HTMLMetaElement
            if (element) {
                element.content = content
            } else {
                element = document.createElement('meta')
                if (selector.includes('property=')) {
                    element.setAttribute('property', selector.match(/property="([^"]*)"/)![1])
                } else if (selector.includes('name=')) {
                    element.setAttribute('name', selector.match(/name="([^"]*)"/)![1])
                }
                element.content = content
                document.head.appendChild(element)
            }
        }

        // Actualizar meta tags básicos
        updateMetaTag('meta[name="title"]', finalTitle)
        updateMetaTag('meta[name="description"]', finalDescription)
        updateMetaTag('meta[name="keywords"]', finalKeywords)
        updateMetaTag('meta[name="robots"]', noIndex ? 'noindex, nofollow' : 'index, follow')

        // Actualizar Open Graph tags
        updateMetaTag('meta[property="og:title"]', finalTitle)
        updateMetaTag('meta[property="og:description"]', finalDescription)
        updateMetaTag('meta[property="og:url"]', finalUrl)
        updateMetaTag('meta[property="og:image"]', finalImage)
        updateMetaTag('meta[property="og:type"]', type)

        // Actualizar Twitter tags
        updateMetaTag('meta[property="twitter:title"]', finalTitle)
        updateMetaTag('meta[property="twitter:description"]', finalDescription)
        updateMetaTag('meta[property="twitter:url"]', finalUrl)
        updateMetaTag('meta[property="twitter:image"]', finalImage)

        // Actualizar canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
        if (canonicalLink) {
            canonicalLink.href = finalUrl
        } else {
            canonicalLink = document.createElement('link')
            canonicalLink.rel = 'canonical'
            canonicalLink.href = finalUrl
            document.head.appendChild(canonicalLink)
        }

        // Actualizar structured data para páginas específicas
        updateStructuredData(location.pathname, finalTitle, finalDescription)

    }, [location.pathname, title, description, keywords, image, url, type, noIndex])

    return null // Este componente no renderiza nada visible
}

// Función para actualizar datos estructurados específicos por página
const updateStructuredData = (pathname: string, title: string, description: string) => {
    let structuredData: any = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description: description,
        url: `${window.location.origin}${pathname}`,
    }

    // Datos estructurados específicos por tipo de página
    if (pathname.includes('/animals')) {
        structuredData = {
            ...structuredData,
            '@type': 'WebApplication',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Animal Management',
        }
    } else if (pathname.includes('/employees')) {
        structuredData = {
            ...structuredData,
            '@type': 'WebApplication',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Human Resources',
        }
    } else if (pathname.includes('/tasks')) {
        structuredData = {
            ...structuredData,
            '@type': 'WebApplication',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Task Management',
        }
    }

    // Actualizar o crear script de datos estructurados
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]#page-structured-data') as HTMLScriptElement
    if (structuredDataScript) {
        structuredDataScript.textContent = JSON.stringify(structuredData)
    } else {
        structuredDataScript = document.createElement('script')
        structuredDataScript.type = 'application/ld+json'
        structuredDataScript.id = 'page-structured-data'
        structuredDataScript.textContent = JSON.stringify(structuredData)
        document.head.appendChild(structuredDataScript)
    }
}