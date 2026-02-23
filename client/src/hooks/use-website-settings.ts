import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWebsiteSettings, defaultWebsiteSettings } from "@/lib/websiteSettingsFirebase";

/**
 * Hook to fetch website settings and update HTML head elements
 */
export function useWebsiteSettings() {
  const { data: settings, isLoading: isQueryLoading } = useQuery({
    queryKey: ["websiteSettings"],
    queryFn: getWebsiteSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 0, // Don't retry if it fails (e.g. offline)
    refetchOnWindowFocus: false,
  });

  // If we are offline, we shouldn't be "loading" indefinitely
  const isLoading = isQueryLoading && navigator.onLine;

  useEffect(() => {
    if (!settings) return;

    // Update document title
    if (settings.websiteName) {
      document.title = `${settings.websiteName} - Auto Import Specialists`;
    }

    // Update favicon
    if (settings.favicon) {
      let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        faviconLink.type = "image/png";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.favicon;
    }

    // Update meta description
    if (settings.metaDescription) {
      let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = settings.metaDescription;
    }

    // Update meta keywords
    if (settings.metaKeywords) {
      let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = settings.metaKeywords;
    }

    // Update Open Graph tags
    if (settings.metaDescription) {
      let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = settings.metaDescription;
    }

    if (settings.websiteName) {
      let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = `${settings.websiteName} - Auto Import Specialists`;
    }
  }, [settings]);

  // Ensure we always return a valid settings object, falling back to defaults if loading or undefined
  const finalSettings = settings || defaultWebsiteSettings;

  return {
    ...finalSettings,
    isLoading
  };
}

