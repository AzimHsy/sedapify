"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- UPDATE PROFILE ---
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatarFile = formData.get("avatar") as File;

  let avatarUrl = null;

  // Handle Image Upload
  if (avatarFile && avatarFile.size > 0) {
    const filename = `${user.id}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, avatarFile);

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return { error: "Failed to upload image" };
    }

    // Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filename);

    avatarUrl = publicUrl;
  }

  // Update Database
  const updates: any = {
    username,
    bio,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) updates.avatar_url = avatarUrl;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

// --- CREATE MANUAL RECIPE ---
export async function createManualRecipe(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cooking_time = formData.get("cooking_time") as string;
  const difficulty = formData.get("difficulty") as string;
  const cuisine = formData.get('cuisine') as string
  const meal_type = formData.get('meal_type') as string
  const dietary = formData.get('dietary') as string

  // Ingredients/Instructions come as JSON strings from the frontend
  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const instructions = JSON.parse(formData.get("instructions") as string);

  const imageFile = formData.get("image") as File;
  let imageUrl = null;

  // Handle Recipe Image Upload
  if (imageFile && imageFile.size > 0) {
    const filename = `recipe-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(filename, imageFile);

    if (uploadError) return { error: "Image upload failed" };

    const {
      data: { publicUrl },
    } = supabase.storage.from("recipe-images").getPublicUrl(filename);
    imageUrl = publicUrl;
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title,
      description,
      ingredients, // JSONB
      instructions, // JSONB
      cooking_time,
      difficulty,
      image_url: imageUrl,
      cuisine,
      meal_type,
      dietary,
      is_ai_generated: false
    })
    .select()
    .single();

  if (error) return { error: error.message };

  redirect(`/recipe/${data.id}`);
}
