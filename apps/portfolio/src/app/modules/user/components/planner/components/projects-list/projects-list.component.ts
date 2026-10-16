import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFolderKanban,
  lucidePlus,
  lucideUsers,
  lucideLayers,
  lucideArrowRight,
  lucideCheck,
  lucideX,
  lucideShield,
  lucideTrash2,
  lucideSettings,
  lucideLogOut,
  lucideClock,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { PlannerStateService } from '../../services/planner-state.service';
import { IPlannerProject } from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideFolderKanban,
      lucidePlus,
      lucideUsers,
      lucideLayers,
      lucideArrowRight,
      lucideCheck,
      lucideX,
      lucideShield,
      lucideTrash2,
      lucideSettings,
      lucideLogOut,
      lucideClock,
      lucideSparkles,
    }),
  ],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent {
  readonly state = inject(PlannerStateService);

  // Modal signal for new project creation
  readonly isCreateModalOpen = signal<boolean>(false);
  newProjectTitle = '';
  newProjectDescription = '';

  openCreateModal(): void {
    this.newProjectTitle = '';
    this.newProjectDescription = '';
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  async handleCreateSubmit(): Promise<void> {
    if (!this.newProjectTitle.trim()) return;
    try {
      await this.state.createProject({
        title: this.newProjectTitle.trim(),
        description: this.newProjectDescription.trim(),
      });
      this.closeCreateModal();
    } catch {}
  }

  getUserRoleLabel(project: IPlannerProject): string {
    if (this.state.isProjectOwner()) return 'Owner';
    const currentMember = project.members.find(
      (m) => m.userId === project.ownerId // or current user
    );
    return currentMember?.role || 'Member';
  }

  onOpenProject(project: IPlannerProject): void {
    this.state.selectProject(project);
  }

  onAcceptInvite(project: IPlannerProject, event: Event): void {
    event.stopPropagation();
    this.state.acceptProjectInvite(project.id);
  }

  onDeclineInvite(project: IPlannerProject, event: Event): void {
    event.stopPropagation();
    this.state.declineProjectInvite(project.id);
  }

  onDeleteProject(project: IPlannerProject, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to archive project "${project.title}"?`)) {
      this.state.deleteProject(project.id);
    }
  }
}
