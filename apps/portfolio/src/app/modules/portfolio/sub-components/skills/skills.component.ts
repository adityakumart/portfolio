import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { HlmBadge } from '@spartan-ng/hel/badge';
import { HlmTooltip } from '@spartan-ng/hel/tooltip';
import { HlmTabsImports } from '@spartan-ng/hel/tabs';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmBadge,
    HlmTooltip,
    HlmTabsImports,
  ],
  templateUrl: './skills.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  resume = input.required<ResumeObject>();
  gridColumns = input.required<number>();

  categories = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'frontend', label: 'Frontend & UI' },
    { id: 'backend', label: 'Backend & Data' },
    { id: 'tools', label: 'Dev & AI Tools' },
  ];
  selectedCategory = signal('all');

  filteredSkills = computed(() => {
    const all = this.resume().skills;
    const cat = this.selectedCategory();
    if (cat === 'all') return all;
    if (cat === 'frontend') {
      return all.filter((s) =>
        [
          'Web Technologies & Languages',
          'Frontend Frameworks & Libraries',
          'UI Component Libraries',
        ].includes(s.name)
      );
    }
    if (cat === 'backend') {
      return all.filter((s) =>
        ['State Management & Data Flow', 'Backend & Databases'].includes(s.name)
      );
    }
    if (cat === 'tools') {
      return all.filter((s) =>
        [
          'Development & AI Tools',
          'Version Control & Workflow',
          'Testing & Build Tools',
        ].includes(s.name)
      );
    }
    return all;
  });

  openInNewTab(url: string) {
    if (url) {
      window.open(url);
    }
  }
}
