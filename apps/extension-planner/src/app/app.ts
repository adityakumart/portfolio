import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompactViewComponent } from '../../../portfolio/src/app/modules/user/components/planner/components/compact-view/compact-view.component';
import { PlannerStateService } from '../../../portfolio/src/app/modules/user/components/planner/services/planner-state.service';
import { PlatformAdapterService } from '../../../portfolio/src/app/modules/user/components/planner/services/platform-adapter.service';

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
