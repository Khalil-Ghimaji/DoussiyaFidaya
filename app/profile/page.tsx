import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/user-actions"
import ProfileForm from "@/components/profile/profile-form"

export const metadata: Metadata = {
  title: "Mon Profil | MediSystem",
  description: "Gérez votre profil et vos informations personnelles",
}

// This page uses Server-Side Rendering (SSR) since it contains user-specific data
export default async function ProfilePage() {
  // Get the current user from the server action
  const user = await getCurrentUser()

  // If no user is logged in, redirect to login page
  if (!user) {
    redirect("/auth/login?callbackUrl=/profile")
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_3fr]">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted text-4xl font-semibold text-muted-foreground">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center">
              <h2 className="font-medium">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div>
          <ProfileForm initialData={user} />
        </div>
      </div>
    </div>
  )
}

