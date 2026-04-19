import { z } from 'zod'

export const registerSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
