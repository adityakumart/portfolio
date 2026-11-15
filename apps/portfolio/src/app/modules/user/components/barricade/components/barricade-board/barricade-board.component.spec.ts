import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarricadeBoardComponent } from './barricade-board.component';
import { BarricadeStateService } from '../../services/barricade-state.service';
import { BarricadeBoardGraphService } from '../../services/barricade-board-graph.service';
import { BarricadeBfsEngineService } from '../../services/barricade-bfs-engine.service';
import { BarricadeSoundService } from '../../services/barricade-sound.service';
import { ToastrService } from '../../../../../../shared/services/toaster.service';

describe('BarricadeBoardComponent - Mobile Touch & Interaction Modes', () => {
  let component: BarricadeBoardComponent;
  let fixture: ComponentFixture<BarricadeBoardComponent>;
  let state: BarricadeStateService;

  beforeEach(async () => {
    const toastrMock = {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      open: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [BarricadeBoardComponent],
      providers: [
        BarricadeStateService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
        BarricadeSoundService,
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarricadeBoardComponent);
    component = fixture.componentInstance;
    state = TestBed.inject(BarricadeStateService);
    state.initGame('vs_computer', 'intro');
    state.status.set('playing');
    fixture.detectChanges();
  });

  it('should initialize with default move mode', () => {
    expect(component).toBeTruthy();
    expect(component.interactionMode()).toBe('move');
  });

  it('should switch interaction mode between move and wall', () => {
    component.setInteractionMode('wall');
    expect(component.interactionMode()).toBe('wall');

    component.setInteractionMode('move');
    expect(component.interactionMode()).toBe('move');
    expect(component.hoveredSlot()).toBeNull();
  });

  it('should preview wall on groove tap and confirm placement', () => {
    component.onWallSlotTap(3, 4);
    expect(component.interactionMode()).toBe('wall');
    expect(component.hoveredSlot()).toBeTruthy();
    expect(component.hoveredSlot()?.row).toBe(3);
    expect(component.hoveredSlot()?.col).toBe(4);
    expect(component.hoveredSlot()?.isLegal).toBe(true);

    const initialWalls = state.walls().length;
    component.confirmWallPlacement();
    expect(state.walls().length).toBe(initialWalls + 1);
    expect(component.hoveredSlot()).toBeNull();
  });

  it('should cancel wall placement preview cleanly', () => {
    component.onWallSlotTap(4, 4);
    expect(component.hoveredSlot()).toBeTruthy();

    component.cancelWallPlacement();
    expect(component.hoveredSlot()).toBeNull();
  });

  it('should rotate wall orientation and update active preview', () => {
    component.onWallSlotTap(2, 2);
    const initialOrientation = state.wallOrientation();

    component.toggleOrientation();
    expect(state.wallOrientation()).not.toBe(initialOrientation);
    expect(component.hoveredSlot()?.orientation).toBe(state.wallOrientation());
  });
});

