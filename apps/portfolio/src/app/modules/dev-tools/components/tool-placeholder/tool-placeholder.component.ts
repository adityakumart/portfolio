import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHammer } from '@ng-icons/lucide';

@Component({
  selector: 'app-tool-placeholder',
  standalone: true,
  imports: [CommonModule, HlmCardDirective, NgIconComponent],
  providers: [provideIcons({ lucideHammer })],
  template: `
    <div class="p-4 flex justify-center items-center min-h-[70vh]">
      <div hlmCard class="max-w-[600px] w-full p-8 text-center rounded-2xl border shadow-sm flex flex-col items-center">
        <div class="mb-5 bg-primary/10 p-5 rounded-full flex items-center justify-center">
          <ng-icon name="lucideHammer" class="text-4xl text-primary flex items-center justify-center"></ng-icon>
        </div>
        <h2 class="text-2xl font-bold mb-2 text-primary">
          {{ toolName }} Tool
        </h2>
        <h3 class="text-sm font-medium text-muted-foreground mb-6">
          Category: {{ categoryName }}
        </h3>
        <p class="text-sm leading-relaxed text-muted-foreground max-w-md">
          The <strong>{{ toolName }}</strong> developer tool is currently under construction.
          Once implemented, it will render here dynamically.
        </p>
      </div>
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
