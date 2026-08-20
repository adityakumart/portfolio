import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: { post: () => Observable<unknown> };
  let mockRouter: { navigate: () => void; url: string };

  beforeEach(() => {
    mockHttpClient = {
      post: () => of({}),
    };
    mockRouter = {
      navigate: () => {},
      url: '/user/profile',
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should automatically log out the user after the idle timeout', async () => {
    const testUser = { email: 'idle_test@example.com', first_name: 'Test', last_name: 'Idle' } as any;

    // Override the timeout to be very short for this test
    (service as any).IDLE_TIMEOUT = 50;

    // Spy on the logout method
    const logoutSpy = vi.spyOn(service, 'logout').mockImplementation(() => Promise.resolve());

    // Set current user to trigger the effect and start the idle timer
    service.currentUser.set(testUser);

    // Wait for the timeout to elapse (50ms timeout, we wait 100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(logoutSpy).toHaveBeenCalled();

    // Clean up to stop any running timers
    service.currentUser.set(null);
  });
});



