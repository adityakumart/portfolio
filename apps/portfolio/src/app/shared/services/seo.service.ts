import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ResumeObject } from '../../../shared/Interface/Resume';

export interface SeoMetaConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  author?: string;
  robots?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  themeColor?: string;
  extraMeta?: { name?: string; property?: string; content: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  private readonly jsonLdScriptId = 'seo-structured-data';

  /**
   * Sets the page document title
   */
  updateTitle(title: string): void {
    if (title) {
      this.titleService.setTitle(title);
    }
  }

  /**
   * Updates standard meta tags, Open Graph tags, and Twitter Cards
   */
  updateMetaTags(config: SeoMetaConfig): void {
    if (config.title) {
      this.updateTitle(config.title);
    }

    if (config.description) {
      this.metaService.updateTag({
        name: 'description',
        content: config.description,
      });
    }

    if (config.keywords) {
      const keywordsStr = Array.isArray(config.keywords)
        ? config.keywords.join(', ')
        : config.keywords;
      this.metaService.updateTag({
        name: 'keywords',
        content: keywordsStr,
      });
    }

    if (config.author) {
      this.metaService.updateTag({
        name: 'author',
        content: config.author,
      });
    }

    if (config.robots) {
      this.metaService.updateTag({
        name: 'robots',
        content: config.robots,
      });
    }

    if (config.themeColor) {
      this.metaService.updateTag({
        name: 'theme-color',
        content: config.themeColor,
      });
    }

    // Open Graph
    const ogTitle = config.ogTitle || config.title;
    if (ogTitle) {
      this.metaService.updateTag({ property: 'og:title', content: ogTitle });
    }

    const ogDesc = config.ogDescription || config.description;
    if (ogDesc) {
      this.metaService.updateTag({
        property: 'og:description',
        content: ogDesc,
      });
    }

    if (config.ogType) {
      this.metaService.updateTag({
        property: 'og:type',
        content: config.ogType,
      });
    }

    const ogUrl = config.ogUrl || config.canonicalUrl;
    if (ogUrl) {
      this.metaService.updateTag({ property: 'og:url', content: ogUrl });
    }

    if (config.ogImage) {
      this.metaService.updateTag({
        property: 'og:image',
        content: config.ogImage,
      });
    }

    if (config.ogSiteName) {
      this.metaService.updateTag({
        property: 'og:site_name',
        content: config.ogSiteName,
      });
    }

    // Twitter Card
    if (config.twitterCard) {
      this.metaService.updateTag({
        name: 'twitter:card',
        content: config.twitterCard,
      });
    }

    const twitterTitle = config.twitterTitle || config.ogTitle || config.title;
    if (twitterTitle) {
      this.metaService.updateTag({
        name: 'twitter:title',
        content: twitterTitle,
      });
    }

    const twitterDesc =
      config.twitterDescription || config.ogDescription || config.description;
    if (twitterDesc) {
      this.metaService.updateTag({
        name: 'twitter:description',
        content: twitterDesc,
      });
    }

    const twitterImage = config.twitterImage || config.ogImage;
    if (twitterImage) {
      this.metaService.updateTag({
        name: 'twitter:image',
        content: twitterImage,
      });
    }

    if (config.twitterSite) {
      this.metaService.updateTag({
        name: 'twitter:site',
        content: config.twitterSite,
      });
    }

    if (config.twitterCreator) {
      this.metaService.updateTag({
        name: 'twitter:creator',
        content: config.twitterCreator,
      });
    }

    // Extra / Custom Meta Tags
    if (config.extraMeta && config.extraMeta.length > 0) {
      for (const meta of config.extraMeta) {
        if (meta.name) {
          this.metaService.updateTag({
            name: meta.name,
            content: meta.content,
          });
        } else if (meta.property) {
          this.metaService.updateTag({
            property: meta.property,
            content: meta.content,
          });
        }
      }
    }

    // Canonical link tag
    if (config.canonicalUrl) {
      this.setCanonicalUrl(config.canonicalUrl);
    }
  }

  /**
   * Injects or updates the canonical link tag in the document <head>
   */
  setCanonicalUrl(url?: string): void {
    if (!this.document || !this.document.head) {
      return;
    }

    const canonicalHref =
      url ||
      (this.document.location
        ? `${this.document.location.origin}${this.document.location.pathname}`
        : 'https://adityakumart.github.io/portfolio/');

    let link: HTMLLinkElement | null = this.document.querySelector(
      "link[rel='canonical']",
    );

    if (link) {
      link.setAttribute('href', canonicalHref);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalHref);
      this.document.head.appendChild(link);
    }
  }

  /**
   * Injects or updates the Schema.org JSON-LD script tag in the document <head>
   */
  setJsonLd(schema: object | object[]): void {
    if (!this.document || !this.document.head) {
      return;
    }

    let script: HTMLScriptElement | null = this.document.getElementById(
      this.jsonLdScriptId,
    ) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = this.jsonLdScriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema, null, 2);
  }

  /**
   * Removes the Schema.org JSON-LD script tag from the document <head>
   */
  removeJsonLd(): void {
    if (!this.document) {
      return;
    }

    const script = this.document.getElementById(this.jsonLdScriptId);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  /**
   * Helper to generate Schema.org JSON-LD structured data from ResumeObject
   */
  generatePortfolioSchema(resume: ResumeObject, siteUrl: string): object {
    const basics = resume.basics;
    const allSkills = resume.skills?.flatMap((s) => s.keywords.map((k) => k.name)) || [];
    const sameAsUrls = [
      ...(basics.socialUrl?.map((s) => s.url) || []),
      ...(basics.profiles?.map((p) => p.url) || []),
    ].filter(Boolean);

    const personId = `${siteUrl}#person`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': personId,
          name: basics.name,
          jobTitle: basics.jobtitle,
          description: basics.summary?.join(' ') || '',
          email: basics.email ? `mailto:${basics.email}` : undefined,
          telephone: basics.phone || undefined,
          url: siteUrl,
          address: {
            '@type': 'PostalAddress',
            addressLocality: basics.location?.city,
            addressRegion: basics.location?.region,
            addressCountry: basics.location?.countryCode,
          },
          sameAs: sameAsUrls,
          knowsAbout: allSkills,
          alumniOf: resume.education?.map((edu) => ({
            '@type': 'EducationalOrganization',
            name: edu.institution,
            url: edu.url,
          })),
          worksFor: resume.work?.map((w) => ({
            '@type': 'Organization',
            name: w.name,
            url: w.url,
          })),
          hasCredential: resume.certificates?.map((cert) => ({
            '@type': 'EducationalOccupationalCredential',
            name: cert.name,
            recognizedBy: {
              '@type': 'Organization',
              name: cert.issuer,
            },
            url: cert.url,
          })),
          award: resume.awards?.map((a) => `${a.title} (${a.awarder})`),
        },
        {
          '@type': 'ProfilePage',
          '@id': siteUrl,
          url: siteUrl,
          name: `${basics.name} | ${basics.jobtitle} Portfolio`,
          mainEntity: { '@id': personId },
          description: `Portfolio and resume of ${basics.name}, ${basics.jobtitle} specializing in Angular, React, TypeScript, and Scalable Frontend Architecture.`,
        },
      ],
    };
  }

  /**
   * Applies complete SEO configuration specifically for the Portfolio page
   */
  setPortfolioSeo(resume: ResumeObject): void {
    const basics = resume.basics;
    const siteUrl = this.document?.location
      ? `${this.document.location.origin}${this.document.location.pathname}`
      : 'https://adityakumart.github.io/portfolio/';

    const allSkills = resume.skills?.flatMap((s) => s.keywords.map((k) => k.name)) || [];

    const title = `${basics.name} | ${basics.jobtitle} & Senior Web Developer`;
    const description = `${basics.name} is a ${basics.jobtitle} with 8+ years of experience specializing in Angular, React, TypeScript, UI Architecture, and building high-performance enterprise web applications.`;
    const keywords = [
      basics.name,
      basics.jobtitle,
      'Frontend Architect',
      'Senior Web Developer',
      'Angular Developer',
      'React Developer',
      'TypeScript',
      'JavaScript',
      'UI Architecture',
      'Design Systems',
      'Web Performance',
      'Hyderabad Developer',
      ...allSkills.slice(0, 15),
    ];

    this.updateMetaTags({
      title,
      description,
      keywords,
      author: basics.name,
      robots: 'index, follow',
      canonicalUrl: siteUrl,
      themeColor: '#0f172a',
      ogTitle: title,
      ogDescription: description,
      ogType: 'profile',
      ogUrl: siteUrl,
      ogSiteName: `${basics.name} Portfolio`,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      extraMeta: [
        { property: 'profile:first_name', content: 'Aditya Kumar' },
        { property: 'profile:last_name', content: 'T' },
        { property: 'profile:username', content: 'adityakumart' },
      ],
    });

    // Inject structured JSON-LD data
    const jsonLdData = this.generatePortfolioSchema(resume, siteUrl);
    this.setJsonLd(jsonLdData);
  }
}
