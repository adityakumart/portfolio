import { UserRole } from './user';

export interface FileNode {
  name: string;
  path: string; // File path/key relative to the active scope
  fullPath?: string; // Absolute storage path
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  uploadedBy?: string;
  ownerId?: string;
  ownerName?: string;
  mimeType?: string;
}

export interface FileScopeInfo {
  userRole: UserRole;
  userId: string;
  userFullName: string;
  rootPath: string;
  uploadDir: string;
  isAdmin: boolean;
  masterFolder?: boolean;
  activePath: string;
}
