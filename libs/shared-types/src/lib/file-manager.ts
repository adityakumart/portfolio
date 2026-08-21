export interface FileNode {
  name: string;
  path: string; // File path/key relative to the user scope
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
}
