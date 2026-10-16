import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideUsers,
  lucideLayers,
  lucideShield,
  lucidePlus,
  lucideTrash2,
  lucideEdit3,
  lucideArrowUp,
  lucideArrowDown,
  lucideCheck,
  lucideX,
  lucideMail,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideSave,
  lucideMoveRight,
  lucideArrowLeft,
  lucideArrowRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { PlannerStateService } from '../../services/planner-state.service';
import {
  IPlannerProject,
  IProjectStage,
  IProjectCustomRole,
  FixedProjectRole,
} from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-project-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, HlmButtonImports, HlmInputImports],
  providers: [
    provideIcons({
      lucideSettings,
      lucideUsers,
      lucideLayers,
      lucideShield,
      lucidePlus,
      lucideTrash2,
      lucideEdit3,
      lucideArrowUp,
      lucideArrowDown,
      lucideCheck,
      lucideX,
      lucideMail,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideSave,
      lucideMoveRight,
      lucideArrowLeft,
      lucideArrowRight,
    }),
  ],
  templateUrl: './project-settings-dialog.component.html',
  styleUrls: ['./project-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingsDialogComponent implements OnInit {
  readonly state = inject(PlannerStateService);

  @Input({ required: true }) project!: IPlannerProject;
  @Input() initialTab?: 'general' | 'collaborators' | 'stages' | 'roles';
  @Output() close = new EventEmitter<void>();

  readonly activeTab = signal<'general' | 'collaborators' | 'stages' | 'roles'>('general');

  // General Tab Form State
  editTitle = '';
  editDescription = '';
  isSavingProject = signal<boolean>(false);

  // Collaborator Invite Form State (Strictly manual email, no autocomplete)
  inviteEmail = '';
  inviteRole: string = 'member';
  isInviting = signal<boolean>(false);

  // Stage Form State (Adding)
  newStageName = '';
  newStageColor = '#3b82f6';
  newStageAllowAllTransitions = true;
  newStageTransitions: string[] = [];
  deleteStageTargetId: string | null = null;
  stageToDelete: IProjectStage | null = null;

  // Editing Existing Stage State
  editingStage: IProjectStage | null = null;
  editingStageName = '';
  editingStageColor = '#64748b';
  editingStageAllowAllTransitions = true;
  editingStageTransitions: string[] = [];

  // Custom Role Form State
  isCreatingRole = signal<boolean>(false);
  newRoleName = '';
  newRoleDesc = '';
  newRolePermissions = {
    canManageProject: false,
    canManageStages: false,
    canManageRoles: false,
    canInviteMembers: false,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: false,
    canMoveCards: true,
    canComment: true,
  };

  fixedRoles: Array<{ id: FixedProjectRole; label: string; desc: string }> = [
    { id: 'admin', label: 'Admin', desc: 'Full control over project, stages, members, and custom roles.' },
    { id: 'member', label: 'Member / Write', desc: 'Can create, edit, move, and comment on cards.' },
    { id: 'reviewer', label: 'Reviewer', desc: 'Can move cards across review stages and comment.' },
    { id: 'triage', label: 'Triage', desc: 'Can prioritize, categorize, tag, and move cards.' },
    { id: 'viewer', label: 'Viewer / Read-Only', desc: 'Can view board and cards without modifying data.' },
  ];

  ngOnInit(): void {
    if (this.initialTab) {
      this.activeTab.set(this.initialTab);
    }
    this.editTitle = this.project?.title || '';
    this.editDescription = this.project?.description || '';
  }

  canManage(): boolean {
    const perms = this.state.activeProjectPermissions();
    return Boolean(this.state.isProjectOwner() || perms?.canManageProject);
  }

  canManageStages(): boolean {
    const perms = this.state.activeProjectPermissions();
    return Boolean(this.state.isProjectOwner() || perms?.canManageStages);
  }

  canInvite(): boolean {
    const perms = this.state.activeProjectPermissions();
    return Boolean(this.state.isProjectOwner() || perms?.canInviteMembers);
  }

  canManageRoles(): boolean {
    const perms = this.state.activeProjectPermissions();
    return Boolean(this.state.isProjectOwner() || perms?.canManageRoles);
  }

  // General tab: Save project details
  async handleSaveProject(): Promise<void> {
    if (!this.editTitle.trim()) return;
    this.isSavingProject.set(true);
    try {
      await this.state.updateProject(this.project.id, {
        title: this.editTitle.trim(),
        description: this.editDescription.trim(),
      });
    } finally {
      this.isSavingProject.set(false);
    }
  }

  // Invite action
  handleInviteSubmit(): void {
    if (!this.inviteEmail.trim()) return;
    this.isInviting.set(true);
    this.state.inviteMember(this.project.id, this.inviteEmail.trim(), this.inviteRole);
    this.inviteEmail = '';
    this.isInviting.set(false);
  }

  // Stage actions: Add
  handleAddStage(): void {
    if (!this.newStageName.trim()) return;
    const targetTransitions = this.newStageAllowAllTransitions
      ? []
      : [...this.newStageTransitions];

    this.state.addStage(
      this.project.id,
      this.newStageName.trim(),
      this.newStageColor,
      targetTransitions
    );
    this.newStageName = '';
    this.newStageColor = '#3b82f6';
    this.newStageAllowAllTransitions = true;
    this.newStageTransitions = [];
  }

  toggleNewStageTransition(targetStageId: string): void {
    if (this.newStageTransitions.includes(targetStageId)) {
      this.newStageTransitions = this.newStageTransitions.filter((id) => id !== targetStageId);
    } else {
      this.newStageTransitions = [...this.newStageTransitions, targetStageId];
    }
  }

  // Stage actions: Edit existing
  startEditStage(stage: IProjectStage): void {
    this.editingStage = stage;
    this.editingStageName = stage.name;
    this.editingStageColor = stage.color || '#64748b';
    this.editingStageAllowAllTransitions =
      !stage.allowedTransitions || stage.allowedTransitions.length === 0;
    this.editingStageTransitions = stage.allowedTransitions
      ? [...stage.allowedTransitions]
      : [];
  }

  cancelEditStage(): void {
    this.editingStage = null;
    this.editingStageTransitions = [];
  }

  toggleEditStageTransition(targetStageId: string): void {
    if (this.editingStageTransitions.includes(targetStageId)) {
      this.editingStageTransitions = this.editingStageTransitions.filter(
        (id) => id !== targetStageId
      );
    } else {
      this.editingStageTransitions = [...this.editingStageTransitions, targetStageId];
    }
  }

  handleSaveEditedStage(): void {
    if (!this.editingStage || !this.editingStageName.trim()) return;
    const targetTransitions = this.editingStageAllowAllTransitions
      ? []
      : [...this.editingStageTransitions];

    this.state.updateStage(this.project.id, this.editingStage.id, {
      name: this.editingStageName.trim(),
      color: this.editingStageColor,
      allowedTransitions: targetTransitions,
    });
    this.editingStage = null;
    this.editingStageTransitions = [];
  }

  get currentProject(): IPlannerProject {
    const sel = this.state.selectedProject();
    if (sel && sel.id === this.project.id) {
      return sel;
    }
    const my = this.state.myProjects().find((p) => p.id === this.project.id);
    if (my) return my;
    const col = this.state.collaborativeProjects().find((p) => p.id === this.project.id);
    if (col) return col;
    return this.project;
  }

  getStageNameById(stageId: string): string {
    const s = this.currentProject.stages.find((st) => st.id === stageId);
    return s ? s.name : stageId;
  }

  // Get allowed forward transitions for a stage.
  // By default, it is the next stage in sequence, and empty for the last stage.
  getStageForwardTransitions(stage: IProjectStage, idx: number): string[] {
    if (Array.isArray(stage.allowedTransitions)) {
      return stage.allowedTransitions;
    }
    // Default value: next stage if not last
    if (idx < this.currentProject.stages.length - 1) {
      return [this.currentProject.stages[idx + 1].id];
    }
    return [];
  }

  isForwardOptionSelected(stage: IProjectStage, idx: number, targetStageId: string): boolean {
    const selected = this.getStageForwardTransitions(stage, idx);
    return selected.includes(targetStageId);
  }

  toggleForwardTransition(stage: IProjectStage, idx: number, targetStageId: string): void {
    const current = this.getStageForwardTransitions(stage, idx);
    const updated = current.includes(targetStageId)
      ? current.filter((id) => id !== targetStageId)
      : [...current, targetStageId];

    this.state.updateStage(this.project.id, stage.id, {
      allowedTransitions: updated,
    });
  }

  onForwardTransitionsSelectChange(stage: IProjectStage, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions).map((opt) => opt.value);
    this.state.updateStage(this.project.id, stage.id, {
      allowedTransitions: selected,
    });
  }

  handleMoveStageHorizontal(stageIndex: number, direction: 'left' | 'right'): void {
    const stages = [...this.currentProject.stages];
    const targetIndex = direction === 'left' ? stageIndex - 1 : stageIndex + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const [moved] = stages.splice(stageIndex, 1);
    stages.splice(targetIndex, 0, moved);
    this.project.stages = stages.map((s, idx) => ({ ...s, order: idx }));
    this.state.reorderStages(this.project.id, stages.map((s) => s.id));
  }

  handleMoveStage(stageIndex: number, direction: 'up' | 'down'): void {
    const stages = [...this.currentProject.stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const [moved] = stages.splice(stageIndex, 1);
    stages.splice(targetIndex, 0, moved);
    this.project.stages = stages.map((s, idx) => ({ ...s, order: idx }));
    this.state.reorderStages(this.project.id, stages.map((s) => s.id));
  }

  promptDeleteStage(stage: IProjectStage): void {
    this.stageToDelete = stage;
    const remaining = this.currentProject.stages.filter((s) => s.id !== stage.id);
    this.deleteStageTargetId = remaining.length > 0 ? remaining[0].id : null;
  }

  confirmDeleteStage(): void {
    if (!this.stageToDelete) return;
    this.state.deleteStage(
      this.project.id,
      this.stageToDelete.id,
      this.deleteStageTargetId || undefined
    );
    this.stageToDelete = null;
    this.deleteStageTargetId = null;
  }

  cancelDeleteStage(): void {
    this.stageToDelete = null;
    this.deleteStageTargetId = null;
  }

  // Custom Role Actions
  handleCreateRoleSubmit(): void {
    if (!this.newRoleName.trim()) return;
    this.state.createCustomRole(this.project.id, {
      name: this.newRoleName.trim(),
      description: this.newRoleDesc.trim(),
      permissions: { ...this.newRolePermissions },
    });
    this.newRoleName = '';
    this.newRoleDesc = '';
    this.isCreatingRole.set(false);
  }

  handleDeleteRole(role: IProjectCustomRole): void {
    if (confirm(`Are you sure you want to delete custom role "${role.name}"?`)) {
      this.state.deleteCustomRole(this.project.id, role.id);
    }
  }
}
