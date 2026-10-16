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
  lucideEdit3,
  lucideArrowLeft,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { PlannerStateService } from '../../services/planner-state.service';
import { IPlannerProject } from '@portfolio/shared-types';
import { ProjectSettingsDialogComponent } from '../project-settings-dialog/project-settings-dialog.component';

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
    ProjectSettingsDialogComponent,
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
      lucideEdit3,
      lucideArrowLeft,
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
  newProjectStages: Array<{ id: string; name: string; color: string; allowedTransitions?: string[] }> = [];
  readonly isAddingStageToNewProject = signal<boolean>(false);
  newStageInputName = '';
  newStageInputColor = '#3b82f6';

  // Modal signal for editing project
  readonly projectToEdit = signal<IPlannerProject | null>(null);

  openCreateModal(): void {
    this.newProjectTitle = '';
    this.newProjectDescription = '';
    this.newProjectStages = [
      { id: 'stage_backlog', name: 'Backlog', color: '#64748b', allowedTransitions: ['stage_in_progress'] },
      { id: 'stage_in_progress', name: 'In Progress', color: '#3b82f6', allowedTransitions: ['stage_in_review'] },
      { id: 'stage_in_review', name: 'In Review', color: '#f59e0b', allowedTransitions: ['stage_done'] },
      { id: 'stage_done', name: 'Done', color: '#10b981', allowedTransitions: [] },
    ];
    this.isAddingStageToNewProject.set(false);
    this.newStageInputName = '';
    this.newStageInputColor = '#3b82f6';
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  addStageToNewProject(): void {
    if (!this.newStageInputName.trim()) return;
    const newId = `stage_${Date.now()}`;
    // If there was a previous stage that had empty transitions, it can now point to this new stage
    const prevStage = this.newProjectStages[this.newProjectStages.length - 1];
    if (prevStage && (!prevStage.allowedTransitions || prevStage.allowedTransitions.length === 0)) {
      prevStage.allowedTransitions = [newId];
    }

    this.newProjectStages.push({
      id: newId,
      name: this.newStageInputName.trim(),
      color: this.newStageInputColor || '#64748b',
      allowedTransitions: [], // last stage is empty by default
    });
    this.newStageInputName = '';
    this.newStageInputColor = '#3b82f6';
    this.isAddingStageToNewProject.set(false);
  }

  moveNewProjectStageHorizontal(index: number, direction: 'left' | 'right'): void {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.newProjectStages.length) return;
    const [moved] = this.newProjectStages.splice(index, 1);
    this.newProjectStages.splice(targetIndex, 0, moved);
  }

  getNewProjectStageTransitions(
    stage: { id: string; allowedTransitions?: string[] },
    idx: number
  ): string[] {
    if (Array.isArray(stage.allowedTransitions)) {
      return stage.allowedTransitions;
    }
    if (idx < this.newProjectStages.length - 1) {
      return [this.newProjectStages[idx + 1].id];
    }
    return [];
  }

  isNewProjectStageTransitionSelected(
    stage: { id: string; allowedTransitions?: string[] },
    idx: number,
    targetId: string
  ): boolean {
    const selected = this.getNewProjectStageTransitions(stage, idx);
    return selected.includes(targetId);
  }

  toggleNewProjectStageTransition(
    stage: { id: string; allowedTransitions?: string[] },
    idx: number,
    targetId: string
  ): void {
    const current = this.getNewProjectStageTransitions(stage, idx);
    const updated = current.includes(targetId)
      ? current.filter((id) => id !== targetId)
      : [...current, targetId];
    stage.allowedTransitions = updated;
  }

  onNewProjectStageSelectChange(
    stage: { id: string; allowedTransitions?: string[] },
    event: Event
  ): void {
    const select = event.target as HTMLSelectElement;
    stage.allowedTransitions = Array.from(select.selectedOptions).map((o) => o.value);
  }

  removeStageFromNewProject(index: number): void {
    if (this.newProjectStages.length <= 1) return;
    const [removed] = this.newProjectStages.splice(index, 1);
    // Prune removed ID from other stages' transitions
    this.newProjectStages.forEach((s) => {
      if (s.allowedTransitions) {
        s.allowedTransitions = s.allowedTransitions.filter((id) => id !== removed.id);
      }
    });
  }

  async handleCreateSubmit(): Promise<void> {
    if (!this.newProjectTitle.trim()) return;
    try {
      await this.state.createProject({
        title: this.newProjectTitle.trim(),
        description: this.newProjectDescription.trim(),
        stages: this.newProjectStages.map((s) => ({
          name: s.name,
          color: s.color,
          allowedTransitions: s.allowedTransitions,
        })),
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

  onEditProject(project: IPlannerProject, event: Event): void {
    event.stopPropagation();
    this.projectToEdit.set(project);
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
