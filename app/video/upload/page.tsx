import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import VideoUploadForm from "@/components/VideoUploadForm" // We will make this client component

export default async function VideoUploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch user's recipes for the dropdown
  const { data: myRecipes } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-6">
      <VideoUploadForm myRecipes={myRecipes || []} />
    </div>
  )
}