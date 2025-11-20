export enum UserRole {
  STUDENT = 'student',
  MILITARY = 'military',
  CIVILIAN = 'civilian',
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  company?: string;
}

