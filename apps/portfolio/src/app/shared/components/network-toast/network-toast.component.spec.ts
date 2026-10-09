import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkToastComponent } from './network-toast.component';
import { NetworkStatusService } from '../../services/network-status.service';

describe('NetworkToastComponent', () => {
  let component: NetworkToastComponent;
  let fixture: ComponentFixture<NetworkToastComponent>;
  let networkService: NetworkStatusService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkToastComponent],
      providers: [NetworkStatusService],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkToastComponent);
    component = fixture.componentInstance;
    networkService = TestBed.inject(NetworkStatusService);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render toast when online', () => {
    const toast = fixture.nativeElement.querySelector('aside');
    expect(toast).toBeNull();
  });

  it('should render offline toast when offline', () => {
    networkService.isOnline.set(false);
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('aside');
    expect(toast).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('You are offline');
  });

  it('should dismiss offline toast when close button is clicked', () => {
    networkService.isOnline.set(false);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('button[aria-label="Close notification"]');
    expect(closeButton).toBeTruthy();

    closeButton.click();
    fixture.detectChanges();

    expect(networkService.isDismissed()).toBe(true);
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });

  it('should render back online toast when showRestored is true', () => {
    networkService.isOnline.set(true);
    networkService.showRestored.set(true);
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('aside');
    expect(toast).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Back online');
  });
});
