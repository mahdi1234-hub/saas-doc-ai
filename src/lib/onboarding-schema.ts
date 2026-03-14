import { z } from "zod";

export const tagSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export type TagItem = z.infer<typeof tagSchema>;

export const onboardingSchema = z.object({
  // Step 1: Workspace Basics
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),

  // Step 2: Preferences
  loginMethod: z.string().min(1, "Please select a login method"),
  termsAgreement: z.literal(true, {
    message: "You must agree to the terms",
  }),

  // Step 3: Workspace Details
  notificationPreferences: z.array(z.string()).optional(),
  workspaceDescription: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  language: z.string().optional(),
  scheduleDays: z.array(z.string()).optional(),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
