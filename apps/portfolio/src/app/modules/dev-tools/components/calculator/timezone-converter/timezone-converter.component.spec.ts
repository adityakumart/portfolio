import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from '../../../shared/services/toaster.service';

import { TimezoneConverterComponent } from './timezone-converter.component';

describe('TimezoneConverterComponent', () => {
  let component: TimezoneConverterComponent;
  let fixture: ComponentFixture<TimezoneConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimezoneConverterComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ToastrService,
          useValue: {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimezoneConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
