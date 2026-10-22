import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BarricadeComponent } from './barricade.component';
import { BarricadeStateService } from './services/barricade-state.service';
import { BarricadeAiService } from './services/barricade-ai.service';
import { BarricadeBoardGraphService } from './services/barricade-board-graph.service';
import { BarricadeBfsEngineService } from './services/barricade-bfs-engine.service';

describe('BarricadeComponent', () => {
  let component: BarricadeComponent;
  let fixture: ComponentFixture<BarricadeComponent>;
  let stateService: BarricadeStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarricadeComponent],
      providers: [
        provideRouter([]),
        BarricadeStateService,
        BarricadeAiService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarricadeComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(BarricadeStateService);
    fixture.detectChanges();
  });

  it('should create the Barricade main component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the game state with 2 players and 11 barricades', () => {
    expect(stateService.players().length).toBe(2);
    expect(stateService.barricades().length).toBe(11);
    expect(stateService.gameMode()).toBe('two_players');
    expect(stateService.phase()).toBe('WAITING_FOR_DICE');
  });

  it('should render the controls, board, and dialog components', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barricade-controls')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-board')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-relocation-dialog')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-win-dialog')).toBeTruthy();
  });
});
