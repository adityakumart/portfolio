import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tool-placeholder',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="p-4" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
      <mat-card style="max-width: 600px; width: 100%; padding: 32px; text-align: center; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.08);">
        <mat-card-header style="justify-content: center; margin-bottom: 20px; display: flex;">
          <div style="background: rgba(63, 81, 181, 0.08); padding: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <mat-icon color="primary" style="font-size: 48px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">construction</mat-icon>
          </div>
        </mat-card-header>
        <mat-card-title style="font-size: 26px; font-weight: 600; margin-bottom: 10px; color: var(--mdc-theme-primary, #3f51b5);">
          {{ toolName }} Tool
        </mat-card-title>
        <mat-card-subtitle style="font-size: 16px; color: var(--mdc-theme-text-secondary-on-background, #666); margin-bottom: 24px;">
          Category: {{ categoryName }}
        </mat-card-subtitle>
        <mat-card-content>
          <p style="font-size: 15px; line-height: 1.6; color: var(--mdc-theme-text-primary-on-background, #333); margin: 0;">
            The <strong>{{ toolName }}</strong> developer tool is currently under construction.
            Once implemented, it will render here dynamically.
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ToolPlaceholderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  toolName = '';
  categoryName = '';

  ngOnInit(): void {
    // Determine category and tool name from path segments: e.g. dev-tools/formatters/json
    // Under DevToolsRoutingModule, path is relative to 'dev-tools', so segments are: ['formatters', 'json']
    const urlSegments = this.route.snapshot.url;
    if (urlSegments.length >= 2) {
      this.categoryName = this.capitalize(urlSegments[0].path);
      this.toolName = this.capitalize(urlSegments[1].path.replace(/-/g, ' '));
    } else if (urlSegments.length === 1) {
      this.toolName = this.capitalize(urlSegments[0].path.replace(/-/g, ' '));
      this.categoryName = 'Dev Tools';
    } else {
      // Check parent route if nested
      const parentSegments = this.route.parent?.snapshot.url || [];
      this.categoryName = parentSegments.length > 0 ? this.capitalize(parentSegments[parentSegments.length - 1].path) : 'Dev Tools';
      this.toolName = 'Overview';
    }
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
}
