import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BarricadeComponent } from './barricade.component';

describe('BarricadeComponent', () => {
  let component: BarricadeComponent;
  let fixture: ComponentFixture<BarricadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarricadeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BarricadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Barricade shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to two_players mode', () => {
    expect(component.selectedMode()).toBe('two_players');
    expect(component.isGameActive()).toBe(false);
  });

  it('should allow toggling game mode to vs_computer and back', () => {
    component.setGameMode('vs_computer');
    expect(component.selectedMode()).toBe('vs_computer');

    component.setGameMode('two_players');
    expect(component.selectedMode()).toBe('two_players');
  });

  it('should set isGameActive to true when launchGame is invoked', () => {
    expect(component.isGameActive()).toBe(false);
    component.launchGame();
    expect(component.isGameActive()).toBe(true);
  });
});
