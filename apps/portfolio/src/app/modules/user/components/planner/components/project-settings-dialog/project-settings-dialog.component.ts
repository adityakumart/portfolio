import {
  Component,
  Input,
  Output,
  EventEmitter,
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
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { PlannerStateService } from '../../services/planner-state.service';
import {
  IPlannerProject,
  IProjectMember,
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
    }),
  ],
  templateUrl: './project-settings-dialog.component.html',
  styleUrls: ['./project-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingsDialogComponent {
  readonly state = inject(PlannerStateService);

  @Input({ required: true }) project!: IPlannerProject;
  @Output() close = new EventEmitter<void>();

  readonly activeTab = signal<'collaborators' | 'stages' | 'roles'>('collaborators');

  // Collaborator Invite Form State (Strictly manual email, no autocomplete)
  inviteEmail = '';
  inviteRole: string = 'member';
  isInviting = signal<boolean>(false);

  // Stage Form State
  newStageName = '';
  newStageColor = '#3b82f6';
  deleteStageTargetId: string | null = null;
  stageToDelete: IProjectStage | null = null;

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

  // Invite action
  handleInviteSubmit(): void {
    if (!this.inviteEmail.trim()) return;
    this.isInviting.set(true);
    this.state.inviteMember(this.project.id, this.inviteEmail.trim(), this.inviteRole);
    this.inviteEmail = '';
    this.isInviting.set(false);
  }

  // Stage actions
  handleAddStage(): void {
    if (!this.newStageName.trim()) return;
    this.state.addStage(this.project.id, this.newStageName.trim(), this.newStageColor);
    this.newStageName = '';
  }

  handleMoveStage(stageIndex: number, direction: 'up' | 'down'): void {
    const stages = [...this.project.stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const [moved] = stages.splice(stageIndex, 1);
    stages.splice(targetIndex, 0, moved);
    this.state.reorderStages(this.project.id, stages.map((s) => s.id));
  }

  promptDeleteStage(stage: IProjectStage): void {
    this.stageToDelete = stage;
    const remaining = this.project.stages.filter((s) => s.id !== stage.id);
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
