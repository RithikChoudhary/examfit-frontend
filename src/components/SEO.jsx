import { useEffect } from 'react';

const SEO = ({ 
  title = 'ExamFit - Free Online Exam Preparation Platform',
  description = 'Prepare for UPSC, SSC, Banking & other competitive exams with free practice tests, study materials, current affairs & expert guidance. Join thousands of successful students.',
  keywords = 'exam preparation, UPSC preparation, SSC exam, competitive exams, free mock tests, study material, current affairs, online learning',
  canonicalUrl = '',
  ogImage = 'https://examfit.in/og-image.png',
  ogType = 'website',
  ogUrl = '',
  structuredData = null,
  noindex = false,
  article = null
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Get base URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://examfit.in';
    const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);
    const fullOgUrl = ogUrl || fullCanonicalUrl;
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update or create link tag
    const updateLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'ExamFit');
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', noindex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('bingbot', noindex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('language', 'English');
    updateMetaTag('revisit-after', '7 days');
    updateMetaTag('rating', 'general');
    updateMetaTag('distribution', 'global');
    updateMetaTag('geo.region', 'IN');
    updateMetaTag('geo.placename', 'India');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', fullOgImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:url', fullOgUrl, true);
    updateMetaTag('og:site_name', 'ExamFit', true);
    updateMetaTag('og:locale', 'en_IN', true);
    updateMetaTag('og:locale:alternate', 'hi_IN', true);

    // Article-specific Open Graph tags
    if (article) {
      if (article.publishedTime) updateMetaTag('article:published_time', article.publishedTime, true);
      if (article.modifiedTime) updateMetaTag('article:modified_time', article.modifiedTime, true);
      if (article.author) updateMetaTag('article:author', article.author, true);
      if (article.section) updateMetaTag('article:section', article.section, true);
      if (article.tags) {
        article.tags.forEach((tag, index) => {
          updateMetaTag(`article:tag`, tag, true);
        });
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullOgImage);
    updateMetaTag('twitter:image:alt', title);
    updateMetaTag('twitter:site', '@examfit');
    updateMetaTag('twitter:creator', '@examfit');
    updateMetaTag('twitter:url', fullOgUrl);

    // Canonical URL
    updateLinkTag('canonical', fullCanonicalUrl);

    // Alternate language links
    const updateAlternateLink = (href, hreflang) => {
      let element = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'alternate');
        element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };
    updateAlternateLink(`${fullCanonicalUrl}?lang=en`, 'en');
    updateAlternateLink(`${fullCanonicalUrl}?lang=hi`, 'hi');

    // Structured Data (JSON-LD) - handle multiple schemas
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => {
        // Only remove if it's from our SEO component (not the base HTML ones)
        if (script.id === 'seo-structured-data') {
          script.remove();
        }
      });

      // Handle array of structured data or single object
      const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
      
      schemas.forEach((schema, index) => {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.id = `seo-structured-data-${index}`;
        scriptElement.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptElement);
      });
    }

    // Cleanup function
    return () => {
      // Clean up dynamic structured data on unmount
      const dynamicScripts = document.querySelectorAll('script[id^="seo-structured-data"]');
      dynamicScripts.forEach(script => script.remove());
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, ogUrl, structuredData, noindex, article]);

  return null; // This component doesn't render anything
};

// Pre-defined structured data templates
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "ExamFit",
  "description": "Free online exam preparation platform for competitive exams in India",
  "url": "https://examfit.in",
  "logo": "https://examfit.in/logo.png",
  "sameAs": [
    "https://facebook.com/examfit",
    "https://twitter.com/examfit",
    "https://instagram.com/examfit",
    "https://youtube.com/examfit"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-98765-43210",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"]
  }
});

export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ExamFit",
  "url": "https://examfit.in",
  "description": "Free online exam preparation platform for competitive exams in India",
  "inLanguage": "en-IN",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://examfit.in/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const getFAQSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const getBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const getCourseSchema = (courseData) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": courseData.name,
  "description": courseData.description,
  "provider": {
    "@type": "EducationalOrganization",
    "name": "ExamFit",
    "url": "https://examfit.com"
  },
  "courseCode": courseData.code,
  "educationalLevel": courseData.level || "Professional",
  "inLanguage": "en-IN",
  "teaches": courseData.teaches || [],
  "coursePrerequisites": courseData.prerequisites || []
});

export const getItemListSchema = (items, name, description) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": name,
  "description": description,
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": item.type || "Thing",
      "name": item.name,
      "url": item.url,
      "description": item.description
    }
  }))
});

export const getWebPageSchema = (pageData) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": pageData.name,
  "description": pageData.description,
  "url": pageData.url,
  "inLanguage": "en-IN",
  "isPartOf": {
    "@type": "WebSite",
    "name": "ExamFit",
    "url": "https://examfit.com"
  },
  "breadcrumb": pageData.breadcrumb || null,
  "mainEntity": pageData.mainEntity || null
});

export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "ExamFit",
  "image": "https://examfit.in/logo.png",
  "url": "https://examfit.in",
  "telephone": "+91-98765-43210",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "New Delhi",
    "addressRegion": "Delhi"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "28.6139",
    "longitude": "77.2090"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  }
});

export default SEO;

