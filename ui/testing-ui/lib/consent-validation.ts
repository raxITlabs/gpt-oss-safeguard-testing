import { z } from 'zod';

// List of common personal email domains to block
const personalEmailDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'yandex.com',
  'zoho.com',
];

export const consentSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .refine(
      (email) => {
        // Check if work email validation is enabled
        if (process.env.NEXT_PUBLIC_REQUIRE_WORK_EMAIL === 'false') {
          return true;
        }

        const domain = email.split('@')[1]?.toLowerCase();
        return !personalEmailDomains.includes(domain);
      },
      {
        message: 'Please use your work email address (personal email domains are not allowed)',
      }
    ),

  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy to continue',
  }),

  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service to continue',
  }),

  acceptSafety: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the safety warning to continue',
  }),
});

export type ConsentFormData = z.infer<typeof consentSchema>;
