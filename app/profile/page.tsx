"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingFlow, type StepData } from "../onboarding/components/onboarding-flow"
import { useUserStore } from "@/store/user-store"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@/types/data-models"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { UserProfile, QualityValue } from "@/types/user-profile"
import { ArrowLeft } from "lucide-react"

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

// Helper function to format quality value
const formatQuality = (quality: QualityValue) => {
  return quality
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useUserStore() as { user: User | null }
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    
    async function fetchProfileData() {
      if (!user?.user_id) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.user_id)
          .single()

        if (error) {
          console.error("Error fetching profile data:", error)
          return
        }

        // If no profile exists, redirect to onboarding
        if (!data || !data.onboarding_completed) {
          router.push("/onboarding")
          return
        }

        setProfileData(data)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set loading to true before fetching
    setIsLoading(true)
    fetchProfileData()
  }, [user, router, supabase])

  const handleProfileUpdate = async (data: StepData) => {
    if (!user?.user_id) return

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            user_id: user.user_id,
            ...data,
            onboarding_completed: true
          },
          { onConflict: "user_id" }
        )

      if (error) throw error
      
      // Refetch profile data to ensure we have the latest
      const { data: updatedData, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single()

      if (fetchError) throw fetchError
      
      setProfileData(updatedData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || !profileData) {
    return null // Let the middleware handle the redirect
  }

  return (
    <div className="flex-1 dark:bg-gray-900 flex flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/documents")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Documents</span>
            </Button>
            <h1 className="sticky-note inline-block px-4 py-2 text-3xl font-bold tracking-tight rotate-[1deg]">
              Your Profile
            </h1>
          </div>
          <Button className="circle-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Personal Details */}
          {profileData.personal_details && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p>{profileData.personal_details.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Pronouns</label>
                  <p>{profileData.personal_details.pronouns}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Cultural Background</label>
                  <p>{profileData.personal_details.cultural_background}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">First Generation Status</label>
                  <p>{profileData.personal_details.first_gen_status ? "Yes" : "No"}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Academic Background */}
          {profileData.academics && profileData.academics.length > 0 && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Academic Background</h2>
              <div className="space-y-4">
                {profileData.academics.map((academic, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Degree</label>
                        <p>{academic.degree}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Major</label>
                        <p>{academic.major}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">GPA</label>
                        <p>{academic.gpa}</p>
                      </div>
                      {academic.research && (
                        <div className="col-span-2">
                          <label className="text-sm text-gray-500">Research</label>
                          <p>{academic.research}</p>
                        </div>
                      )}
                    </div>
                    {academic.coursework && academic.coursework.length > 0 && (
                      <div className="mt-2">
                        <label className="text-sm text-gray-500">Relevant Coursework</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {academic.coursework.map((course, idx) => (
                            <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Work Experience */}
          {profileData.experience && profileData.experience.length > 0 && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                      </div>
                    </div>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Extracurricular Activities */}
          {profileData.extracurriculars && profileData.extracurriculars.length > 0 && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Extracurricular Activities</h2>
              <div className="space-y-4">
                {profileData.extracurriculars.map((activity, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{activity.activity}</h3>
                        <p className="text-gray-600">{activity.role}</p>
                      </div>
                      <div className="text-sm text-gray-500">{activity.duration}</div>
                    </div>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Achievements */}
          {profileData.achievements && profileData.achievements.length > 0 && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Achievements</h2>
              <div className="space-y-4">
                {profileData.achievements.map((achievement, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <span className="text-sm text-gray-500 capitalize">{achievement.category}</span>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(achievement.date)}</div>
                    </div>
                    <p className="text-gray-700">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Personal Qualities */}
          {profileData.qualities && profileData.qualities.length > 0 && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Qualities</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.qualities.map((quality, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                    {formatQuality(quality)}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Writing Tone */}
          {profileData.tone_preference && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Writing Tone Preference</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-500">Preferred Tone</label>
                  <p className="font-medium">{profileData.tone_preference.tone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p>{profileData.tone_preference.description}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Supporting Documents */}
          {profileData.supporting_docs && (
            <Card className="page-card p-6">
              <h2 className="text-xl font-semibold mb-4">Supporting Documents</h2>
              <div className="space-y-4">
                {profileData.supporting_docs.resume && (
                  <div>
                    <label className="text-sm text-gray-500">Resume</label>
                    <p className="text-blue-600 hover:underline cursor-pointer">
                      {profileData.supporting_docs.resume}
                    </p>
                  </div>
                )}
                {profileData.supporting_docs.transcripts && profileData.supporting_docs.transcripts.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">Transcripts</label>
                    <div className="space-y-1">
                      {profileData.supporting_docs.transcripts.map((transcript, index) => (
                        <p key={index} className="text-blue-600 hover:underline cursor-pointer">
                          {transcript}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {isEditing && (
          <OnboardingFlow
            isOpen={true}
            onClose={() => setIsEditing(false)}
            onComplete={handleProfileUpdate}
            initialData={profileData}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  )
} 