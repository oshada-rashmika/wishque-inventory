export const DEPARTMENTS = [
  'HR',
  'Accounts',
  'Operations',
  'Product Development',
  'Bakery',
  'Floral',
  'Stores',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface DepartmentOption {
  label: Department;
  value: Department;
}

export const USER_ROLES = ['Chef', 'Assistant Manager', 'Admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserRoleOption {
  label: UserRole;
  value: UserRole;
}