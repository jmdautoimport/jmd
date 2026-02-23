import { useEffect } from "react";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

export function SEO({ title, description, image, type = "website", noindex = false }: SEOProps) {
  const [location] = useLocation();
  const { isLoading, ...settings } = useWebsiteSettings();

  const getAbsoluteUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (typeof window !== "undefined") {
      try {
        return new URL(url, window.location.origin).toString();
      } catch {
        return url;
      }
    }
    return url;
  };

  useEffect(() => {
    if (!settings) return;

    // Update document title
    const siteName = settings.websiteName || "Auto Import Specialists";
    const pageTitle = title ? `${siteName} | ${title}` : siteName;
    document.title = pageTitle;

    // Update meta description
    const metaDesc = description || settings.metaDescription || settings.description || "Premier vehicle import specialist in Australia. Sourcing, shipping, and compliance for performance cars.";
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = metaDesc;

    // Update keywords
    if (settings.metaKeywords) {
      let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = settings.metaKeywords;
    }

    // Update canonical URL
    const canonicalUrl = typeof window !== "undefined" ? window.location.origin + location : location;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Update Open Graph tags
    const ogTitle = pageTitle;
    const ogDesc = description || settings.metaDescription || settings.description || "";
    const defaultOgImage =
      getAbsoluteUrl(settings.logo) ||
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"; // Updated to a more import-style car image
    const ogImage = getAbsoluteUrl(image) || defaultOgImage;

    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    updateOGTag("og:title", ogTitle);
    updateOGTag("og:description", ogDesc);
    updateOGTag("og:url", canonicalUrl);
    updateOGTag("og:type", type);
    if (ogImage) {
      updateOGTag("og:image", ogImage);
      updateOGTag("og:image:width", "1200");
      updateOGTag("og:image:height", "630");
    }
    updateOGTag("og:locale", "en_AU");
    if (settings.websiteName) {
      updateOGTag("og:site_name", settings.websiteName);
    }

    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    updateTwitterTag("twitter:card", "summary_large_image");
    updateTwitterTag("twitter:title", ogTitle);
    updateTwitterTag("twitter:description", ogDesc);
    if (ogImage) {
      updateTwitterTag("twitter:image", ogImage);
    }

    // Robots meta tag
    if (noindex) {
      let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    }

    // Add structured data (JSON-LD) for LocalBusiness / AutoDealer
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "name": settings.companyName || settings.websiteName || "Auto Import Specialists",
      "description": settings.description || settings.metaDescription || "Specialist in high-quality vehicle imports and compliance in Australia.",
      "url": canonicalUrl,
      "telephone": settings.phone || "",
      "email": settings.email || "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.address?.split(",")[0] || "Brisbane",
        "addressLocality": settings.address?.match(/[A-Za-z]+/g)?.[1] || "Brisbane",
        "addressRegion": settings.address?.match(/NSW|VIC|QLD|WA|SA|TAS|NT|ACT/)?.[0] || "QLD",
        "postalCode": settings.address?.match(/\d{4}/)?.[0] || "",
        "addressCountry": "AU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-27.4698",
        "longitude": "153.0251"
      },
      "priceRange": "Enquire",
      "areaServed": {
        "@type": "Country",
        "name": "Australia"
      },
      "sameAs": [
        settings.facebookUrl,
        settings.xUrl,
        settings.instagramUrl,
        settings.linkedinUrl
      ].filter(Boolean)
    };

    // Remove existing structured data script
    let existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
  }, [settings, title, description, image, type, noindex, location]);

  return null;
}

