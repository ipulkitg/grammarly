import { z } from "zod"

export interface PersonalDetails {
  name: string
  pronouns: string
  cultural_background: string
  first_gen_status: boolean
}

export interface Academic {
  degree: string
  gpa: string
  major: string
  coursework: string[]
  research: string
}

export interface Experience {
  title: string
  company: string
  start_date: string
  end_date: string | null
  description: string
}

export interface Extracurricular {
  activity: string
  role: string
  description: string
  duration: string
}

export interface Achievement {
  title: string
  date: string
  description: string
  category: 'award' | 'publication' | 'competition' | 'other'
}

// Define the possible quality values
export type QualityValue = 
  | 'democratic_leadership'
  | 'directive_leadership'
  | 'coaching_leadership'
  | 'direct_communication'
  | 'diplomatic_communication'
  | 'analytical_communication'
  | 'structured_work'
  | 'flexible_work'
  | 'innovative_work'

// PersonalQualities is now a string array
export type PersonalQualities = QualityValue[]

export interface TonePreference {
  tone: string
  description: string
}

export interface SupportingDocs {
  resume: string | null
  transcripts: string[]
}

export interface UserProfile {
  profile_id: string
  user_id: string
  personal_details: PersonalDetails
  academics: Academic[]
  experience: Experience[]
  extracurriculars: Extracurricular[]
  achievements: Achievement[]
  qualities: PersonalQualities
  tone_preference: TonePreference
  supporting_docs: SupportingDocs
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// Zod schemas for runtime validation
export const personalDetailsSchema = z.object({
  name: z.string().optional(),
  pronouns: z.string().optional(),
  cultural_background: z.string().optional(),
  first_gen_status: z.boolean().optional()
})

export const academicSchema = z.object({
  degree: z.string().optional(),
  gpa: z.string().optional(),
  major: z.string().optional(),
  coursework: z.array(z.string()).optional(),
  research: z.string().optional()
})

export const experienceSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
})

export const extracurricularSchema = z.object({
  activity: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional()
})

export const achievementSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional()
})

export const qualitiesSchema = z.array(z.string()).optional()

export const tonePreferenceSchema = z.object({
  tone: z.string().optional(),
  description: z.string().optional()
}).optional()

export const supportingDocsSchema = z.object({
  resume: z.string().nullable().optional(),
  transcripts: z.array(z.string()).optional()
}).optional()

export const userProfileSchema = z.object({
  personal_details: personalDetailsSchema.optional(),
  academics: z.array(academicSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  extracurriculars: z.array(extracurricularSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  qualities: qualitiesSchema.optional(),
  tone_preference: tonePreferenceSchema.optional(),
  supporting_docs: supportingDocsSchema.optional(),
  onboarding_completed: z.boolean().optional()
}) 