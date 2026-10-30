import { useEffect } from 'react';

interface SEOTagsOptions {
  title: string;
  description: string;
  robots?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogTitle?: string;
  ogDescription?: string;
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, any>;
}

export function useSEO({
  title,
  description,
  robots = 'index, follow',
  canonicalUrl,
  ogType = 'article',
  ogTitle,
  ogDescription,
  publishedTime,
  author = 'Ama Baby Care',
  jsonLd
}: SEOTagsOptions) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to get or create a meta tag
    const getOrCreateMeta = (attrName: string, attrValue: string): HTMLMetaElement => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Meta Description
    const metaDesc = getOrCreateMeta('name', 'description');
    metaDesc.setAttribute('content', description);

    // 3. Robots Indexing
    const metaRobots = getOrCreateMeta('name', 'robots');
    metaRobots.setAttribute('content', robots);

    // 4. Canonical URL
    const currentUrl = canonicalUrl || (window.location.origin + window.location.pathname);
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 5. Open Graph - Specific Article Type Support
    const ogSiteNameMeta = getOrCreateMeta('property', 'og:site_name');
    ogSiteNameMeta.setAttribute('content', 'Ama Baby Care');

    const ogTypeMeta = getOrCreateMeta('property', 'og:type');
    ogTypeMeta.setAttribute('content', ogType);

    const ogTitleMeta = getOrCreateMeta('property', 'og:title');
    ogTitleMeta.setAttribute('content', ogTitle || title);

    const ogDescMeta = getOrCreateMeta('property', 'og:description');
    ogDescMeta.setAttribute('content', ogDescription || description);

    const ogUrlMeta = getOrCreateMeta('property', 'og:url');
    ogUrlMeta.setAttribute('content', currentUrl);

    if (ogType === 'article') {
      if (publishedTime) {
        const publishedTimeMeta = getOrCreateMeta('property', 'article:published_time');
        publishedTimeMeta.setAttribute('content', publishedTime);
      }
      const authorMeta = getOrCreateMeta('property', 'article:author');
      authorMeta.setAttribute('content', author);
    }

    // 6. Twitter / X Card
    const twitterCardMeta = getOrCreateMeta('name', 'twitter:card');
    twitterCardMeta.setAttribute('content', 'summary_large_image');

    const twitterTitleMeta = getOrCreateMeta('name', 'twitter:title');
    twitterTitleMeta.setAttribute('content', ogTitle || title);

    const twitterDescMeta = getOrCreateMeta('name', 'twitter:description');
    twitterDescMeta.setAttribute('content', ogDescription || description);

    // 7. Dynamic Route JSON-LD Schema (supplements the primary index.html JSON-LD schema)
    if (jsonLd) {
      let scriptEl = document.getElementById('dynamic-route-jsonld') as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-route-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }

  }, [title, description, robots, canonicalUrl, ogType, ogTitle, ogDescription, publishedTime, author, jsonLd]);
}
