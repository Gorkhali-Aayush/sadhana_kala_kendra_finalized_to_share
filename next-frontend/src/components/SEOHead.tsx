/**
 * SEO Head Component
 * Renders SEO meta tags and JSON-LD schemas for Next.js
 * Works with both App Router (metadata export) and traditional Head approach
 */

import Head from "next/head";

interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

interface JSONLDSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

interface SEOHeadProps {
  metadata: SEOMetadata;
  schemas?: JSONLDSchema[];
  children?: React.ReactNode;
}

/**
 * Convert SEOMetadata to Next.js Metadata format (for use in layout.tsx)
 * Usage in layout.tsx or page.tsx:
 * export const metadata = seoHeadToMetadata(seoData);
 */
export function seoHeadToMetadata(seoMetadata: SEOMetadata) {
  const siteName = "Sadhana Kala Kendra";
  const defaultImage = "https://www.sadhanakalakendra.com/og-image.png";

  return {
    title: seoMetadata.title || siteName,
    description: seoMetadata.description || "",
    keywords: seoMetadata.keywords || "",
    openGraph: {
      title: seoMetadata.og?.title || seoMetadata.title || siteName,
      description: seoMetadata.og?.description || seoMetadata.description || "",
      images: [seoMetadata.og?.image || defaultImage],
      type: seoMetadata.og?.type || "website",
      url: seoMetadata.og?.url || seoMetadata.canonical || "",
      siteName: siteName,
      locale: "en_IN",
    },
    twitter: {
      card: seoMetadata.twitter?.card || "summary_large_image",
      title: seoMetadata.twitter?.title || seoMetadata.title || siteName,
      description: seoMetadata.twitter?.description || seoMetadata.description || "",
      images: [seoMetadata.twitter?.image || defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googlebot: "index, follow",
    },
    ...(seoMetadata.canonical && { alternates: { canonical: seoMetadata.canonical } }),
  };
}

/**
 * SEOHead Component - For backward compatibility with Head-based approach
 * Renders meta tags for use in getServerSideProps or similar
 */
export default function SEOHead({ metadata, schemas = [], children }: SEOHeadProps) {
  const siteName = "Sadhana Kala Kendra";
  const defaultImage = "https://www.sadhanakalakendra.com/og-image.png";

  return (
    <Head>
      {/* Essential Meta Tags */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Sadhana Kala Kendra" />
      <meta name="rating" content="general" />

      {/* Title and Description */}
      <title>{metadata.title || siteName}</title>
      <meta name="description" content={metadata.description || ""} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}

      {/* Canonical URL */}
      {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}

      {/* Open Graph Tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:title" content={metadata.og?.title || metadata.title || siteName} />
      <meta property="og:description" content={metadata.og?.description || metadata.description || ""} />
      <meta property="og:image" content={metadata.og?.image || defaultImage} />
      <meta property="og:type" content={metadata.og?.type || "website"} />
      <meta property="og:url" content={metadata.og?.url || metadata.canonical || ""} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metadata.twitter?.card || "summary_large_image"} />
      <meta name="twitter:title" content={metadata.twitter?.title || metadata.title || siteName} />
      <meta name="twitter:description" content={metadata.twitter?.description || metadata.description || ""} />
      <meta name="twitter:image" content={metadata.twitter?.image || defaultImage} />
      <meta name="twitter:site" content="@sadhanakalakendra" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* JSON-LD Structured Data Schemas */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* Additional content from children */}
      {children}
    </Head>
  );
}
