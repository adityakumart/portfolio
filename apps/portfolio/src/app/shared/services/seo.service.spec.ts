import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';
import { SeoService } from './seo.service';
import { ResumeObject } from '../../../shared/Interface/Resume';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let document: Document;

  const mockResume: ResumeObject = {
    basics: {
      name: 'Aditya Kumar T',
      jobtitle: 'Product Group Lead Frontend',
      image: 'https://example.com/avatar.jpg',
      email: 'aditya.togaru@gmail.com',
      phone: '+91 9505028181',
      socialUrl: [
        {
          name: 'LinkedIn',
          url: 'https://www.linkedin.com/in/aditya-kumar-togaru/',
        },
      ],
      summary: ['8+ years experience in web development'],
      location: {
        address: '',
        postalCode: '',
        city: 'Hyderabad',
        countryCode: 'India',
        region: 'Telangana',
      },
      profiles: [
        {
          network: 'Github',
          username: 'adityakumart',
          url: 'https://github.com/adityakumart',
        },
      ],
    },
    work: [
      {
        name: 'OVA INNOVATION LABS',
        position: 'Product Group Lead Frontend',
        url: 'https://curately.ai',
        startDate: '2018-01',
        endDate: 'Present',
        summary: '',
        highlights: [],
        projects: [],
      },
    ],
    volunteer: [],
    education: [
      {
        institution: 'GIET',
        url: 'https://giet.ac.in',
        area: 'CS',
        studyType: 'B.Tech',
        startDate: '2012',
        endDate: '2016',
        score: '67',
        courses: [],
      },
    ],
    awards: [
      {
        title: 'Super Applause Award',
        date: '2019-12',
        awarder: 'OVA Innovation Labs',
        summary: 'Awarded for performance',
      },
    ],
    certificates: [
      {
        name: 'Angular Guide',
        date: '2021-01',
        issuer: 'Udemy',
        url: 'https://udemy.com/cert',
      },
    ],
    publications: [],
    skills: [
      {
        name: 'Frontend',
        keywords: [
          { name: 'Angular', url: 'https://angular.dev' },
          { name: 'React', url: 'https://react.dev' },
        ],
      },
    ],
    languages: [],
    interests: [],
    references: [],
    projects: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService, Title, Meta],
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    service.removeJsonLd();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update document title', () => {
    service.updateTitle('Test Title');
    expect(titleService.getTitle()).toBe('Test Title');
  });

  it('should update meta tags including Open Graph and Twitter cards', () => {
    service.updateMetaTags({
      title: 'Portfolio Test',
      description: 'Test description',
      keywords: ['Angular', 'TypeScript'],
      author: 'Aditya Kumar T',
      robots: 'index, follow',
      ogType: 'website',
      twitterCard: 'summary_large_image',
    });

    expect(metaService.getTag('name="description"')?.content).toBe(
      'Test description',
    );
    expect(metaService.getTag('name="keywords"')?.content).toBe(
      'Angular, TypeScript',
    );
    expect(metaService.getTag('name="author"')?.content).toBe('Aditya Kumar T');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe(
      'Portfolio Test',
    );
    expect(metaService.getTag('name="twitter:card"')?.content).toBe(
      'summary_large_image',
    );
  });

  it('should inject and remove canonical link', () => {
    service.setCanonicalUrl('https://example.com/portfolio');
    const link = document.querySelector(
      "link[rel='canonical']",
    ) as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/portfolio');
  });

  it('should inject and remove Schema.org JSON-LD structured data', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Aditya Kumar T',
    };
    service.setJsonLd(schema);

    let script = document.getElementById(
      'seo-structured-data',
    ) as HTMLScriptElement;
    expect(script).toBeTruthy();
    expect(script.type).toBe('application/ld+json');
    expect(JSON.parse(script.textContent || '{}')).toEqual(schema);

    service.removeJsonLd();
    script = document.getElementById(
      'seo-structured-data',
    ) as HTMLScriptElement;
    expect(script).toBeNull();
  });

  it('should generate valid portfolio schema and apply portfolio SEO', () => {
    service.setPortfolioSeo(mockResume);

    expect(titleService.getTitle()).toContain('Aditya Kumar T');
    expect(metaService.getTag('name="description"')?.content).toContain(
      'Aditya Kumar T',
    );
    expect(metaService.getTag('property="og:title"')?.content).toContain(
      'Aditya Kumar T',
    );

    const script = document.getElementById(
      'seo-structured-data',
    ) as HTMLScriptElement;
    expect(script).toBeTruthy();

    const parsed = JSON.parse(script.textContent || '{}');
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toBeDefined();
    expect(parsed['@graph'].length).toBe(2);
    expect(parsed['@graph'][0]['@type']).toBe('Person');
    expect(parsed['@graph'][0]['name']).toBe('Aditya Kumar T');
    expect(parsed['@graph'][1]['@type']).toBe('ProfilePage');
  });
});
