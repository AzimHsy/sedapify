'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadVideoAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const caption = formData.get("caption") as string
  const linkedRecipeId = formData.get("linkedRecipeId") as string
  const videoFile = formData.get("video") as File

  if (!videoFile) return { error: "No video selected" }

  // 1. Upload Video to Storage
  const filename = `${user.id}-${Date.now()}.mp4`
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filename, videoFile)

  if (uploadError) return { error: "Upload failed: " + uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(filename)

  // 2. Save to Database
  const { error: dbError } = await supabase
    .from("cooking_videos")
    .insert({
      user_id: user.id,
      video_url: publicUrl,
      caption: caption,
      linked_recipe_id: linkedRecipeId === "none" ? null : linkedRecipeId
    })

  if (dbError) return { error: dbError.message }

  revalidatePath("/discover")
  revalidatePath("/profile")
  return { success: true }
}

// --- VIDEO INTERACTIONS ---

export async function toggleVideoLike(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login required" }

  const { data: existing } = await supabase.from('likes').select().eq('user_id', user.id).eq('video_id', videoId).single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ user_id: user.id, video_id: videoId })
  }
  revalidatePath('/discover')
}

export async function toggleVideoSave(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login required" }

  const { data: existing } = await supabase.from('saved_recipes').select().eq('user_id', user.id).eq('video_id', videoId).single()

  if (existing) {
    await supabase.from('saved_recipes').delete().eq('id', existing.id)
  } else {
    await supabase.from('saved_recipes').insert({ user_id: user.id, video_id: videoId })
  }
  revalidatePath('/discover')
}