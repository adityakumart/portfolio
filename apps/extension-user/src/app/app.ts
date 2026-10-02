import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckSquare,
  lucideBot,
  lucideFolder,
  lucideActivity,
  lucideExternalLink,
  lucideSparkles,
} from '@ng-icons/lucide';

import {
  CompactViewComponent,
  PlannerStateService,
  PlatformAdapterService,
  ProfileAiChatComponent,
  FileManagerComponent,
  DietHydrationComponent,
} from '@portfolio/feature-user';

export type UserWorkspaceTab = 'planner' | 'ai' | 'files' | 'diet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    CompactViewComponent,
    ProfileAiChatComponent,
    FileManagerComponent,
    DietHydrationComponent,
  ],
  providers: [
    provideIcons({
      lucideCheckSquare,
      lucideBot,
      lucideFolder,
      lucideActivity,
      lucideExternalLink,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="user-workspace-shell">
      <!-- Top Navigation & Workspace Switcher Header -->
      <header class="workspace-header">
        <div class="workspace-branding">
          <div class="brand-avatar">
            <ng-icon name="lucideSparkles" class="brand-icon"></ng-icon>
          </div>
          <div class="brand-meta">
            <h1 class="brand-title">User Workspace</h1>
            <span class="brand-status">Connected</span>
          </div>
        </div>

        <button
          type="button"
          class="open-app-btn"
          (click)="onOpenFullApp(activeTab())"
          title="Open in full web browser"
        >
          <ng-icon name="lucideExternalLink"></ng-icon>
          <span class="btn-label">Full App</span>
        </button>
      </header>

      <!-- Sub-Module Tabs Nav -->
      <nav class="submodule-nav">
        <button
          type="button"
          class="nav-tab-item"
          [class.active]="activeTab() === 'planner'"
          (click)="activeTab.set('planner')"
        >
          <ng-icon name="lucideCheckSquare"></ng-icon>
          <span>Planner</span>
        </button>

        <button
          type="button"
          class="nav-tab-item"
          [class.active]="activeTab() === 'ai'"
          (click)="activeTab.set('ai')"
        >
          <ng-icon name="lucideBot"></ng-icon>
          <span>AI Assistant</span>
        </button>

        <button
          type="button"
          class="nav-tab-item"
          [class.active]="activeTab() === 'files'"
          (click)="activeTab.set('files')"
        >
          <ng-icon name="lucideFolder"></ng-icon>
          <span>Files</span>
        </button>

        <button
          type="button"
          class="nav-tab-item"
          [class.active]="activeTab() === 'diet'"
          (click)="activeTab.set('diet')"
        >
          <ng-icon name="lucideActivity"></ng-icon>
          <span>Diet & Hydration</span>
        </button>
      </nav>

      <!-- Active Content View Area -->
      <main class="workspace-content">
        @switch (activeTab()) {
          @case ('planner') {
            <app-planner-compact-view
              (openFullApp)="onOpenFullApp('planner')"
            ></app-planner-compact-view>
          }
          @case ('ai') {
            <div class="embedded-ai-wrapper">
              <app-profile-ai-chat [isEmbedded]="true"></app-profile-ai-chat>
            </div>
          }
          @case ('files') {
            <div class="embedded-view-wrapper">
              <app-file-manager></app-file-manager>
            </div>
          }
          @case ('diet') {
            <div class="embedded-view-wrapper">
              <app-diet-hydration></app-diet-hydration>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--background, #09090b);
        color: var(--foreground, #fafafa);
        font-family: inherit;
      }

      .user-workspace-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .workspace-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: rgba(24, 24, 27, 0.85);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--border, #27272a);
        position: sticky;
        top: 0;
        z-index: 40;
      }

      .workspace-branding {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .brand-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25));
        border: 1px solid rgba(16, 185, 129, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;

        .brand-icon {
          color: #10b981;
          font-size: 1rem;
        }
      }

      .brand-meta {
        display: flex;
        flex-direction: column;

        .brand-title {
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0;
          color: #fafafa;
        }

        .brand-status {
          font-size: 0.65rem;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.25rem;

          &::before {
            content: '';
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: #10b981;
          }
        }
      }

      .open-app-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.35rem 0.6rem;
        border-radius: 6px;
        background: rgba(39, 39, 42, 0.8);
        border: 1px solid var(--border, #3f3f46);
        color: #a1a1aa;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: #27272a;
          color: #ffffff;
          border-color: #52525b;
        }
      }

      .submodule-nav {
        display: flex;
        align-items: center;
        background: #121215;
        border-bottom: 1px solid var(--border, #27272a);
        padding: 0.25rem 0.5rem;
        gap: 0.25rem;
        overflow-x: auto;
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .nav-tab-item {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #a1a1aa;
        background: transparent;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;

        &:hover {
          color: #f4f4f5;
          background: rgba(39, 39, 42, 0.5);
        }

        &.active {
          color: #ffffff;
          background: #27272a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
      }

      .workspace-content {
        flex: 1;
        overflow-y: auto;
      }

      .embedded-ai-wrapper {
        min-height: 520px;
        display: flex;
        flex-direction: column;
      }

      .embedded-view-wrapper {
        padding: 0.75rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private plannerState = inject(PlannerStateService);
  private platform = inject(PlatformAdapterService);

  readonly activeTab = signal<UserWorkspaceTab>('planner');

  ngOnInit(): void {
    this.plannerState.loadDashboard();
  }

  onOpenFullApp(tab: UserWorkspaceTab = 'planner'): void {
    const routeMap: Record<UserWorkspaceTab, string> = {
      planner: 'planner',
      ai: 'ai',
      files: 'files',
      diet: 'diet-hydration',
    };

    const targetRoute = routeMap[tab] || 'planner';
    const url = `http://localhost:4200/user/${targetRoute}`;
    const w = window as any;
    if (w.chrome?.tabs?.create) {
      w.chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }
}
