import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TimezoneConverterComponent } from './timezone-converter.component';

describe('TimezoneConverterComponent', () => {
  let component: TimezoneConverterComponent;
  let fixture: ComponentFixture<TimezoneConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimezoneConverterComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TimezoneConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
