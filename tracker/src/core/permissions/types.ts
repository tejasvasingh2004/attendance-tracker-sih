/**
 * Permission-related type definitions
 */

export interface PermissionResult {
  granted: boolean;
  deniedPermissions: string[];
}

export interface PermissionGroup {
  name: string;
  permissions: string[];
}
