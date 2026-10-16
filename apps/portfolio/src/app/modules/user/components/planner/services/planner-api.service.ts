import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../services/auth';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  IPlannerDashboardResponse,
  IPlannerProject,
  IProjectsListResponse,
  ICreateProjectDto,
  IUpdateProjectDto,
  IInviteMemberDto,
  IUpdateMemberRoleDto,
  ICreateStageDto,
  IUpdateStageDto,
  IReorderStagesDto,
  ICreateCustomRoleDto,
  IUpdateCustomRoleDto,
  IProjectPermissions,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class PlannerApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get baseUrl(): string {
    return `${environment.APIURL}/user/planner`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getDashboard(): Observable<IPlannerDashboardResponse> {
    return this.http.get<IPlannerDashboardResponse>(`${this.baseUrl}/dashboard`, {
      headers: this.getHeaders(),
    });
  }

  // Notes
  getNotes(search?: string, tag?: string): Observable<INote[]> {
    let url = `${this.baseUrl}/notes`;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http.get<INote[]>(url, { headers: this.getHeaders() });
  }

  createNote(dto: ICreateNoteDto): Observable<INote> {
    return this.http.post<INote>(`${this.baseUrl}/notes`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateNote(id: string, dto: IUpdateNoteDto): Observable<INote> {
    return this.http.put<INote>(`${this.baseUrl}/notes/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteNote(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/notes/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Todos
  getTodos(status?: string, priority?: string, dueDate?: string): Observable<ITodoItem[]> {
    let url = `${this.baseUrl}/todos`;
    const params: string[] = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
    if (dueDate) params.push(`dueDate=${encodeURIComponent(dueDate)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http.get<ITodoItem[]>(url, { headers: this.getHeaders() });
  }

  createTodo(dto: ICreateTodoDto): Observable<ITodoItem> {
    return this.http.post<ITodoItem>(`${this.baseUrl}/todos`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateTodo(id: string, dto: IUpdateTodoDto): Observable<ITodoItem> {
    return this.http.put<ITodoItem>(`${this.baseUrl}/todos/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  toggleTodo(id: string): Observable<ITodoItem> {
    return this.http.patch<ITodoItem>(`${this.baseUrl}/todos/${id}/toggle`, {}, {
      headers: this.getHeaders(),
    });
  }

  deleteTodo(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/todos/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Reminders
  getActiveReminders(): Observable<ITodoItem[]> {
    return this.http.get<ITodoItem[]>(`${this.baseUrl}/reminders/active`, {
      headers: this.getHeaders(),
    });
  }

  snoozeReminder(id: string, minutes: number = 10): Observable<ITodoItem> {
    return this.http.post<ITodoItem>(
      `${this.baseUrl}/todos/${id}/snooze`,
      { minutes },
      { headers: this.getHeaders() },
    );
  }

  // -------------------------------------------------------------------------
  // Collaborative Projects (GitHub Projects-style)
  // -------------------------------------------------------------------------
  getProjects(): Observable<IProjectsListResponse> {
    return this.http.get<IProjectsListResponse>(`${this.baseUrl}/projects`, {
      headers: this.getHeaders(),
    });
  }

  createProject(dto: ICreateProjectDto): Observable<IPlannerProject> {
    return this.http.post<IPlannerProject>(`${this.baseUrl}/projects`, dto, {
      headers: this.getHeaders(),
    });
  }

  getProject(id: string): Observable<{
    project: IPlannerProject;
    permissions: IProjectPermissions;
    role: string;
    isOwner: boolean;
  }> {
    return this.http.get<{
      project: IPlannerProject;
      permissions: IProjectPermissions;
      role: string;
      isOwner: boolean;
    }>(`${this.baseUrl}/projects/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updateProject(id: string, dto: IUpdateProjectDto): Observable<IPlannerProject> {
    return this.http.put<IPlannerProject>(`${this.baseUrl}/projects/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteProject(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/projects/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Member Invitations & Access
  inviteMember(
    projectId: string,
    dto: IInviteMemberDto
  ): Observable<{ success: boolean; project: IPlannerProject }> {
    return this.http.post<{ success: boolean; project: IPlannerProject }>(
      `${this.baseUrl}/projects/${projectId}/members`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  acceptInvitation(
    projectId: string
  ): Observable<{ success: boolean; project: IPlannerProject }> {
    return this.http.post<{ success: boolean; project: IPlannerProject }>(
      `${this.baseUrl}/projects/${projectId}/accept`,
      {},
      { headers: this.getHeaders() }
    );
  }

  declineInvitation(projectId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/projects/${projectId}/decline`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updateMemberRole(
    projectId: string,
    userId: string,
    dto: IUpdateMemberRoleDto
  ): Observable<IPlannerProject> {
    return this.http.patch<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/members/${userId}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  removeMember(
    projectId: string,
    userId: string
  ): Observable<{ success: boolean; project: IPlannerProject }> {
    return this.http.delete<{ success: boolean; project: IPlannerProject }>(
      `${this.baseUrl}/projects/${projectId}/members/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // Dynamic Vertical Workflow Stages
  addStage(projectId: string, dto: ICreateStageDto): Observable<IPlannerProject> {
    return this.http.post<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/stages`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  updateStage(
    projectId: string,
    stageId: string,
    dto: IUpdateStageDto
  ): Observable<IPlannerProject> {
    return this.http.patch<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/stages/${stageId}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  reorderStages(
    projectId: string,
    dto: IReorderStagesDto
  ): Observable<IPlannerProject> {
    return this.http.put<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/stages/reorder`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  deleteStage(
    projectId: string,
    stageId: string,
    fallbackStageId?: string
  ): Observable<IPlannerProject> {
    let url = `${this.baseUrl}/projects/${projectId}/stages/${stageId}`;
    if (fallbackStageId) {
      url += `?fallbackStageId=${encodeURIComponent(fallbackStageId)}`;
    }
    return this.http.delete<IPlannerProject>(url, { headers: this.getHeaders() });
  }

  // Custom Roles (RBAC)
  createCustomRole(
    projectId: string,
    dto: ICreateCustomRoleDto
  ): Observable<IPlannerProject> {
    return this.http.post<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/roles`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  updateCustomRole(
    projectId: string,
    roleId: string,
    dto: IUpdateCustomRoleDto
  ): Observable<IPlannerProject> {
    return this.http.patch<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/roles/${roleId}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  deleteCustomRole(
    projectId: string,
    roleId: string
  ): Observable<IPlannerProject> {
    return this.http.delete<IPlannerProject>(
      `${this.baseUrl}/projects/${projectId}/roles/${roleId}`,
      { headers: this.getHeaders() }
    );
  }

  // Project Todos & Transitions
  getProjectTodos(projectId: string): Observable<ITodoItem[]> {
    return this.http.get<ITodoItem[]>(
      `${this.baseUrl}/projects/${projectId}/todos`,
      { headers: this.getHeaders() }
    );
  }

  transitionTodoStage(todoId: string, stageId: string): Observable<ITodoItem> {
    return this.http.patch<ITodoItem>(
      `${this.baseUrl}/todos/${todoId}/stage`,
      { stageId },
      { headers: this.getHeaders() }
    );
  }
}
