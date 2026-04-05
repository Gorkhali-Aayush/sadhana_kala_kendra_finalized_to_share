/**
 * SEO Configuration for Sadhana Kala Kendra
 * Contains hardcoded SEO metadata for all pages
 */

// Brand Information
export const BRAND_CONFIG = {
  name: "Sadhana Kala Kendra",
  description: "A premier cultural institute dedicated to preserving and promoting traditional Indian arts and classical music",
  url: "https://www.sadhanakalakendra.com",
  logo: "https://www.sadhanakalakendra.com/logo.png",
  image: "https://www.sadhanakalakendra.com/og-image.png",
  social: {
    facebook: "https://www.facebook.com/sadhanakalakendra",
    instagram: "https://www.instagram.com/sadhanakalakendra",
    youtube: "https://www.youtube.com/sadhanakalakendra",
  },
  contact: {
    phone: "+91-XXXXXXXXXX",
    email: "info@sadhanakalakendra.com",
    address: "Sadhana Kala Kendra, [Your Address Here]",
  },
  locale: "en_IN",
};

// Static Pages SEO Configuration
export const STATIC_PAGES_SEO = {
  home: {
    title: "Sadhana Kala Kendra - Classical Music & Traditional Arts Academy",
    description: "Discover the art of classical music and traditional Indian arts at Sadhana Kala Kendra. Expert teachers, comprehensive courses, and cultural programs.",
    keywords: "classical music, Indian arts, music academy, traditional arts, vocal training, instrument classes",
    canonical: "https://www.sadhanakalakendra.com",
    ogImage: "https://www.sadhanakalakendra.com/og-images/home.jpg",
    ogType: "website",
  },
  about: {
    title: "About Sadhana Kala Kendra - Our Mission & History",
    description: "Learn about Sadhana Kala Kendra's mission to preserve and promote classical Indian music and traditional arts through expert instruction and cultural programming.",
    keywords: "about us, music academy, classical music school, Indian arts institute, music education",
    canonical: "https://www.sadhanakalakendra.com/about",
    ogImage: "https://www.sadhanakalakendra.com/og-images/about.jpg",
    ogType: "website",
  },
  courses: {
    title: "Classical Music & Arts Courses - Sadhana Kala Kendra",
    description: "Explore our comprehensive range of classical music and traditional arts courses. Learn from expert instructors in vocal, instrumental, and cultural programs.",
    keywords: "music courses, classical training, vocal classes, instrument lessons, arts education, online music courses",
    canonical: "https://www.sadhanakalakendra.com/courses",
    ogImage: "https://www.sadhanakalakendra.com/og-images/courses.jpg",
    ogType: "website",
  },
  teachers: {
    title: "Expert Music Teachers - Sadhana Kala Kendra",
    description: "Meet our experienced and accomplished teachers specialized in classical music, vocals, and traditional instruments. Learn from masters of their craft.",
    keywords: "music teachers, classical instructors, vocal coaches, instrument teachers, experienced tutors",
    canonical: "https://www.sadhanakalakendra.com/teachers",
    ogImage: "https://www.sadhanakalakendra.com/og-images/teachers.jpg",
    ogType: "website",
  },
  events: {
    title: "Classical Music Events & Performances - Sadhana Kala Kendra",
    description: "Explore upcoming concerts, recitals, and cultural events featuring classical music performances and traditional arts at Sadhana Kala Kendra.",
    keywords: "classical music events, concerts, recitals, cultural performances, music events, live performances",
    canonical: "https://www.sadhanakalakendra.com/events",
    ogImage: "https://www.sadhanakalakendra.com/og-images/events.jpg",
    ogType: "website",
  },
  gallery: {
    title: "Gallery - Photos & Videos - Sadhana Kala Kendra",
    description: "View photos and videos from our classical music performances, events, and cultural programs at Sadhana Kala Kendra.",
    keywords: "gallery, photos, videos, performances, events, classical music, Indian arts",
    canonical: "https://www.sadhanakalakendra.com/gallery",
    ogImage: "https://www.sadhanakalakendra.com/og-images/gallery.jpg",
    ogType: "website",
  },
  activities: {
    title: "Cultural Activities & Programs - Sadhana Kala Kendra",
    description: "Explore our ongoing cultural activities and programs designed to promote classical Indian music and traditional arts.",
    keywords: "cultural activities, music programs, arts workshops, cultural events, classical training",
    canonical: "https://www.sadhanakalakendra.com/activities",
    ogImage: "https://www.sadhanakalakendra.com/og-images/activities.jpg",
    ogType: "website",
  },
  news: {
    title: "News & Updates - Sadhana Kala Kendra",
    description: "Stay updated with the latest news, announcements, and updates from Sadhana Kala Kendra.",
    keywords: "news, updates, announcements, classical music news, cultural updates",
    canonical: "https://www.sadhanakalakendra.com/news",
    ogImage: "https://www.sadhanakalakendra.com/og-images/news.jpg",
    ogType: "website",
  },
  artists: {
    title: "Classical Music Artists - Sadhana Kala Kendra",
    description: "Meet the accomplished classical music artists and performers associated with Sadhana Kala Kendra.",
    keywords: "classical artists, musicians, performers, classical music artists, Indian musicians",
    canonical: "https://www.sadhanakalakendra.com/artists",
    ogImage: "https://www.sadhanakalakendra.com/og-images/artists.jpg",
    ogType: "website",
  },
  offers: {
    title: "Special Offers & Discounts - Sadhana Kala Kendra",
    description: "Check out our latest special offers and discounts on music courses and cultural programs.",
    keywords: "offers, discounts, scholarships, special offers, course offers",
    canonical: "https://www.sadhanakalakendra.com/offers",
    ogImage: "https://www.sadhanakalakendra.com/og-images/offers.jpg",
    ogType: "website",
  },
  register: {
    title: "Register for Courses - Sadhana Kala Kendra",
    description: "Sign up for classical music and arts courses at Sadhana Kala Kendra. Begin your journey into the world of traditional Indian music.",
    keywords: "register, enrollment, course registration, music classes, arts courses",
    canonical: "https://www.sadhanakalakendra.com/register",
    ogImage: "https://www.sadhanakalakendra.com/og-images/register.jpg",
    ogType: "website",
  },
};

// Default SEO values for dynamic pages
export const DEFAULT_DYNAMIC_SEO = {
  image: "https://www.sadhanakalakendra.com/default-og-image.jpg",
  keywords: "Sadhana Kala Kendra, classical music, Indian arts",
  twitterCard: "summary_large_image",
};

// JSON-LD Schema Templates
export const SCHEMA_TEMPLATES = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND_CONFIG.name,
    "description": BRAND_CONFIG.description,
    "url": BRAND_CONFIG.url,
    "logo": BRAND_CONFIG.logo,
    "image": BRAND_CONFIG.image,
    "sameAs": Object.values(BRAND_CONFIG.social),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BRAND_CONFIG.contact.address,
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "telephone": BRAND_CONFIG.contact.phone,
      "email": BRAND_CONFIG.contact.email,
    },
  },

  course: (course) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.course_name,
    "description": course.description,
    "image": course.image_url,
    "url": `${BRAND_CONFIG.url}/courses/${course.slug}`,
    "provider": {
      "@type": "Organization",
      "name": BRAND_CONFIG.name,
    },
    ...(course.level && { "educationLevel": course.level }),
    ...(course.price && {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "INR",
      },
    }),
  }),

  event: (event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.event_name,
    "description": event.description,
    "image": event.image_url || "https://www.sadhanakalakendra.com/default-event.jpg",
    "startDate": event.event_date,
    "endDate": event.event_date,
    "eventStatus": event.category === "upcoming" ? "EventScheduled" : "EventMovedOnline",
    "eventAttendanceMode": "OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.venue,
    },
    "organizer": {
      "@type": "Organization",
      "name": BRAND_CONFIG.name,
      "url": BRAND_CONFIG.url,
    },
  }),

  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${BRAND_CONFIG.url}${item.url}`,
    })),
  }),

  person: (teacher) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": teacher.full_name,
    "image": teacher.profile_image,
    "jobTitle": teacher.specialization,
    "description": teacher.bio || teacher.seo_description,
    "url": `${BRAND_CONFIG.url}/teachers/${teacher.slug}`,
    "worksFor": {
      "@type": "Organization",
      "name": BRAND_CONFIG.name,
    },
  }),

  article: (news) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "description": news.seo_description || news.description,
    "image": news.image_url,
    "datePublished": news.news_date,
    "dateModified": news.updated_at,
    "author": {
      "@type": "Organization",
      "name": BRAND_CONFIG.name,
    },
    "publisher": {
      "@type": "Organization",
      "name": BRAND_CONFIG.name,
      "logo": {
        "@type": "ImageObject",
        "url": BRAND_CONFIG.logo,
      },
    },
  }),
};

export default {
  BRAND_CONFIG,
  STATIC_PAGES_SEO,
  DEFAULT_DYNAMIC_SEO,
  SCHEMA_TEMPLATES,
};
