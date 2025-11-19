import { z } from 'zod';
import { UserRole } from '@/types/auth';

export const registerSchema = z
  .object({
    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string({ message: 'Password must be a string' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string({ message: 'Confirm password must be a string' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
    role: z.union([z.nativeEnum(UserRole), z.literal('')]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => {
    return data.role !== '' && Object.values(UserRole).includes(data.role as UserRole);
  }, {
    message: 'Role is required',
    path: ['role'],
  });

// Form values type (allows empty string for role during input)
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Final form data type (role must be UserRole)
export type RegisterFormData = Omit<RegisterFormValues, 'role'> & {
  role: UserRole;
};

