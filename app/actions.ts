"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { redirect } from "next/navigation";

const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY });

export async function generateRecipeAction(formData: FormData) {
  const ingredients = formData.get("ingredients") as string;
  const supabase = await createClient();

  // 1. Authenticate User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Prompt Engineering
  const prompt = `
    You are a master chef. Create a Malaysian-fusion recipe using these ingredients: ${ingredients}. 
    Strictly return a valid JSON object with this structure:
    {
      "title": "Recipe Name",
      "description": "Short description",
      "ingredients": ["Item 1", "Item 2"],
      "instructions": ["Step 1", "Step 2"],
      "cooking_time": "30 mins",
      "difficulty": "Easy"
    }
  `;

  try {
    // 3. Call AI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo", // or 'gpt-4o' if you have budget
      response_format: { type: "json_object" },
    });

    const recipeData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // 4. Save to Database
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients, // This works because we used jsonb type
        instructions: recipeData.instructions, // This works because we used jsonb type
        cooking_time: recipeData.cooking_time,
        difficulty: recipeData.difficulty,
        is_ai_generated: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 5. Redirect to the new recipe
    return { success: true, recipeId: data.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate recipe" };
  }
}
