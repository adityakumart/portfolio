import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CompactViewComponent,
  PlannerStateService,
  PlatformAdapterService,
} from '@portfolio/feature-user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CompactViewComponent],
  template: `
    <app-planner-compact-view (openFullApp)="onOpenFullApp()"></app-planner-compact-view>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private state = inject(PlannerStateService);
  private platform = inject(PlatformAdapterService);

  ngOnInit(): void {
    this.state.loadDashboard();
  }

  onOpenFullApp(): void {
    const w = window as any;
    const url = 'http://localhost:4200/user/planner';
    if (w.chrome?.tabs?.create) {
      w.chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }
}
