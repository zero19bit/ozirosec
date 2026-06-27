import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
};

const BASE_URL = 'https://ozirosec.ir';

const routeSeo: Record<string, SeoConfig> = {
  '/': {
    title: 'Oziro Sec | Cybersecurity & Bug Bounty Learning Platform',
    description:
      'Oziro Sec is a cybersecurity and bug bounty learning platform featuring practical labs, learning paths, security tools, resources, and write-ups.',
  },
  '/labs': {
    title: 'Interactive Cybersecurity Labs | Oziro Sec',
    description:
      'Practice web security and bug bounty skills through interactive cybersecurity labs and realistic vulnerability scenarios.',
  },
  '/vulnerabilities': {
    title: 'Web Vulnerabilities and Security Guides | Oziro Sec',
    description:
      'Learn about SQL injection, XSS, CSRF, access control, authentication flaws, and other web vulnerabilities.',
  },
  '/writeups': {
    title: 'Bug Bounty and Security Write-ups | Oziro Sec',
    description:
      'Read practical bug bounty reports, vulnerability research, security write-ups, and real-world exploitation techniques.',
  },
  '/paths': {
    title: 'Cybersecurity Learning Paths | Oziro Sec',
    description:
      'Follow structured cybersecurity and bug bounty learning paths from beginner to advanced levels.',
  },
  '/resources': {
    title: 'Cybersecurity Resources | Oziro Sec',
    description:
      'Explore curated cybersecurity resources, references, cheat sheets, and bug bounty learning materials.',
  },
  '/glossary': {
    title: 'Cybersecurity Glossary | Oziro Sec',
    description:
      'Understand important cybersecurity, web security, penetration testing, and bug bounty terminology.',
  },
  '/achievements': {
    title: 'Security Learning Achievements | Oziro Sec',
    description:
      'Explore achievements and milestones available through the Oziro Sec cybersecurity learning platform.',
  },
  '/tools/encoder': {
    title: 'Security Encoder and Decoder Tool | Oziro Sec',
    description:
      'Encode and decode common security formats with the free Oziro Sec encoder and decoder tool.',
  },
  '/tools/interceptor': {
    title: 'HTTP Request Interceptor Tool | Oziro Sec',
    description:
      'Inspect and understand HTTP requests and responses using the Oziro Sec security interceptor tool.',
  },
  '/tools/report-generator': {
    title: 'Bug Bounty Report Generator | Oziro Sec',
    description:
      'Create structured and professional vulnerability and bug bounty reports with the Oziro Sec report generator.',
  },
};

const noIndexPrefixes = [
  '/login',
  '/register',
  '/verify-email',
  '/dashboard',
  '/admin',
  '/search',
];

function updateMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function resolveSeo(pathname: string): SeoConfig {
  if (routeSeo[pathname]) {
    return routeSeo[pathname];
  }

  if (pathname.startsWith('/labs/')) {
    return {
      title: 'Interactive Security Lab | Oziro Sec',
      description:
        'Practice cybersecurity techniques in an interactive Oziro Sec security lab.',
    };
  }

  if (pathname.startsWith('/vulnerabilities/')) {
    return {
      title: 'Web Vulnerability Guide | Oziro Sec',
      description:
        'Learn how a web vulnerability works, how it is identified, and how it can be prevented.',
    };
  }

  if (pathname.startsWith('/writeups/')) {
    return {
      title: 'Security Write-up | Oziro Sec',
      description:
        'Read a practical cybersecurity and bug bounty write-up from Oziro Sec.',
    };
  }

  return {
    title: 'Oziro Sec | Cybersecurity Learning Platform',
    description:
      'Learn cybersecurity, web security, and bug bounty hunting with Oziro Sec.',
  };
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);
    const shouldNoIndex = noIndexPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    document.title = seo.title;

    updateMeta('name', 'description', seo.description);
    updateMeta(
      'name',
      'robots',
      shouldNoIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );

    updateMeta('property', 'og:title', seo.title);
    updateMeta('property', 'og:description', seo.description);
    updateMeta('property', 'og:url', canonicalUrl);

    updateMeta('name', 'twitter:title', seo.title);
    updateMeta('name', 'twitter:description', seo.description);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (shouldNoIndex) {
      canonical?.remove();
      return;
    }

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}
