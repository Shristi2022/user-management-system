import { z } from 'zod';

// Base User validation schema
export const createUserSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Full name must be at least 3 characters'),
    
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
    
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    
  dateOfBirth: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Please enter a valid date of birth',
    })
  ),
  
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Please select a valid gender option',
  }),
  
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(10, 'Address must be at least 10 characters'),
    
  occupation: z
    .string({ required_error: 'Occupation is required' })
    .trim()
    .min(1, 'Occupation is required'),
    
  skills: z
    .array(z.string().trim().min(1, 'Skill tag cannot be empty'), {
      required_error: 'Skills are required',
    })
    .min(1, 'At least one skill must be provided'),
    
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
    
  profileImage: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

// Update User validation schema
// Reuses the createUserSchema, but makes all fields optional for partial updates (PATCH)
export const updateUserSchema = createUserSchema.partial();

// Infer TypeScript types from Zod schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
