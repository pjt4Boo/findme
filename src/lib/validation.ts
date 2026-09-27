import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    fullName: z.string().min(2, 'Please enter your full name.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const foundCaseSchema = z.object({
  approxAgeMin: z.number().int().min(0).max(150, 'Age must be between 0 and 150.'),
  approxAgeMax: z.number().int().min(0).max(150, 'Age must be between 0 and 150.'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']),
  clothing: z.string().max(500, 'Clothing description is too long.').optional().or(z.literal('')),
  description: z
    .string()
    .min(10, 'Please provide at least 10 characters of description.')
    .max(2000, 'Description is too long.'),
  locationLabel: z.string().min(2, 'Please provide an approximate location label.'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  foundAt: z.string().min(1, 'Please select when you found this person.'),
  isChild: z.boolean(),
  consent: z.literal(true, { message: 'You must acknowledge the consent notice.' }),
});

export const missingCaseSchema = z.object({
  personName: z.string().min(1, 'Please enter the person name.').max(200, 'Name is too long.'),
  ageMin: z.number().int().min(0).max(150),
  ageMax: z.number().int().min(0).max(150),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']),
  clothing: z.string().max(500).optional().or(z.literal('')),
  description: z
    .string()
    .min(10, 'Please provide at least 10 characters of description.')
    .max(2000, 'Description is too long.'),
  locationLabel: z.string().min(2, 'Please provide an approximate location label.'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  lastSeenAt: z.string().min(1, 'Please select when this person was last seen.'),
  policeReference: z.string().max(200).optional().or(z.literal('')),
  additionalInfo: z.string().max(2000).optional().or(z.literal('')),
  isChild: z.boolean(),
  consent: z.literal(true, { message: 'You must acknowledge the consent notice.' }),
});

export const reportSchema = z.object({
  reason: z.enum(['FAKE_CASE', 'WRONG_PERSON', 'HARASSMENT', 'PRIVACY_CONCERN', 'INAPPROPRIATE_IMAGE', 'SCAM', 'OTHER']),
  description: z.string().max(1000, 'Description is too long.').optional().or(z.literal('')),
});

export const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FoundCaseInput = z.infer<typeof foundCaseSchema>;
export type MissingCaseInput = z.infer<typeof missingCaseSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
