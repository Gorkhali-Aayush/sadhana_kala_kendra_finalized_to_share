/**
 * Backend SEO Service
 * Provides methods to retrieve SEO metadata for all pages
 */

import {
  BRAND_CONFIG,
  STATIC_PAGES_SEO,
  DEFAULT_DYNAMIC_SEO,
  SCHEMA_TEMPLATES,
} from "../utils/seoConfig.js";

class SEOService {
  /**
   * Get SEO metadata for a static page
   * @param {string} page - Page name (e.g., 'home', 'about', 'courses')
   * @returns {object} SEO metadata
   */
  static getStaticPageSEO(page) {
    const pageData = STATIC_PAGES_SEO[page] || {};
    return {
      title: pageData.title || BRAND_CONFIG.name,
      description: pageData.description || BRAND_CONFIG.description,
      keywords: pageData.keywords || DEFAULT_DYNAMIC_SEO.keywords,
      canonical: pageData.canonical || BRAND_CONFIG.url,
      ogImage: pageData.ogImage || DEFAULT_DYNAMIC_SEO.image,
      ogType: pageData.ogType || "website",
      twitterCard: DEFAULT_DYNAMIC_SEO.twitterCard,
      locale: BRAND_CONFIG.locale,
    };
  }

  /**
   * Get SEO metadata for a dynamic item (course, event, news, teacher, etc.)
   * @param {string} type - Content type (course, event, news, teacher, etc.)
   * @param {object} item - The item data
   * @returns {object} SEO metadata
   */
  static getDynamicSEO(type, item) {
    if (!item) {
      return this.getDefaultSEO();
    }

    const seoData = {
      title: item.seo_title || item.title || item.course_name || item.full_name || BRAND_CONFIG.name,
      description: item.seo_description || item.description || BRAND_CONFIG.description,
      keywords: item.seo_keywords || DEFAULT_DYNAMIC_SEO.keywords,
      canonical: this.getCanonicalUrl(type, item),
      ogImage: item.image_url || item.profile_image || DEFAULT_DYNAMIC_SEO.image,
      ogType: "article",
      twitterCard: DEFAULT_DYNAMIC_SEO.twitterCard,
      locale: BRAND_CONFIG.locale,
      author: BRAND_CONFIG.name,
      publishedDate: item.created_at,
      updatedDate: item.updated_at,
    };

    return seoData;
  }

  /**
   * Get default SEO values
   * @returns {object} Default SEO metadata
   */
  static getDefaultSEO() {
    return {
      title: BRAND_CONFIG.name,
      description: BRAND_CONFIG.description,
      keywords: DEFAULT_DYNAMIC_SEO.keywords,
      canonical: BRAND_CONFIG.url,
      ogImage: DEFAULT_DYNAMIC_SEO.image,
      ogType: "website",
      twitterCard: DEFAULT_DYNAMIC_SEO.twitterCard,
      locale: BRAND_CONFIG.locale,
    };
  }

  /**
   * Build canonical URL for an item
   * @param {string} type - Content type
   * @param {object} item - The item
   * @returns {string} Canonical URL
   */
  static getCanonicalUrl(type, item) {
    const slug = item.slug || item.id;
    const typeMap = {
      course: "courses",
      event: "events",
      news: "news",
      gallery: "gallery",
      teacher: "teachers",
      artist: "artists",
      offer: "offers",
      activity: "activities",
      program: "programs",
      bod: "about", // board of directors typically on about page
    };

    const path = typeMap[type] || type;
    return `${BRAND_CONFIG.url}/${path}/${slug}`;
  }

  /**
   * Generate JSON-LD schema for an item
   * @param {string} type - Content type
   * @param {object} item - The item data
   * @returns {object} JSON-LD schema
   */
  static getSchema(type, item) {
    if (!item) {
      return SCHEMA_TEMPLATES.organization;
    }

    const schemaMap = {
      course: SCHEMA_TEMPLATES.course,
      event: SCHEMA_TEMPLATES.event,
      teacher: SCHEMA_TEMPLATES.person,
      artist: SCHEMA_TEMPLATES.person,
      news: SCHEMA_TEMPLATES.article,
    };

    const schemaGenerator = schemaMap[type];
    return schemaGenerator ? schemaGenerator(item) : SCHEMA_TEMPLATES.organization;
  }

  /**
   * Generate breadcrumb schema
   * @param {array} breadcrumbs - Array of breadcrumb items with { name, url }
   * @returns {object} Breadcrumb JSON-LD schema
   */
  static getBreadcrumbSchema(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return null;
    }

    return SCHEMA_TEMPLATES.breadcrumb(breadcrumbs);
  }

  /**
   * Enhance meta tags with Open Graph and Twitter Card tags
   * @param {object} seoData - SEO metadata
   * @returns {object} Enhanced metadata with OG and Twitter tags
   */
  static enhanceMetaTags(seoData) {
    return {
      ...seoData,
      og: {
        title: seoData.title,
        description: seoData.description,
        image: seoData.ogImage,
        type: seoData.ogType,
        url: seoData.canonical,
      },
      twitter: {
        card: seoData.twitterCard,
        title: seoData.title,
        description: seoData.description,
        image: seoData.ogImage,
      },
    };
  }

  /**
   * Get complete SEO package for a page (metadata + schema)
   * @param {string} type - Page/content type
   * @param {object} item - Item data (optional, null for static pages)
   * @param {array} breadcrumbs - Breadcrumb items (optional)
   * @returns {object} Complete SEO package
   */
  static getCompleteSEOPackage(type, item = null, breadcrumbs = null) {
    let seoData;

    if (item) {
      seoData = this.getDynamicSEO(type, item);
    } else {
      seoData = this.getStaticPageSEO(type);
    }

    const enhancedMeta = this.enhanceMetaTags(seoData);
    const schema = this.getSchema(type, item);
    const breadcrumbSchema = this.getBreadcrumbSchema(breadcrumbs);

    return {
      meta: enhancedMeta,
      schema: schema,
      breadcrumb: breadcrumbSchema,
      brand: BRAND_CONFIG,
    };
  }
}

export default SEOService;
