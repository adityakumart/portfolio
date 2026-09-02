import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PortfolioComponent } from './portfolio.component';
import { SeoService } from '../../shared/services/seo.service';

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let seoService: SeoService;

  beforeAll(() => {
    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PortfolioComponent],
      providers: [provideRouter([]), SeoService],
    });
    seoService = TestBed.inject(SeoService);
    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
  });

  it('should create and set portfolio SEO on init', () => {
    const seoSpy = vi.spyOn(seoService, 'setPortfolioSeo');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(seoSpy).toHaveBeenCalledWith(component.resume());
  });

  it('should cleanup SEO structured data on destroy', () => {
    fixture.detectChanges();
    const removeSpy = vi.spyOn(seoService, 'removeJsonLd');
    component.ngOnDestroy();
    expect(removeSpy).toHaveBeenCalled();
  });
});

