"use server";

import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { redirect } from "next/navigation";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateRecipeAction(formData: FormData) {
  const ingredients = formData.get("ingredients") as string;
  const cuisine = formData.get("cuisine") as string; // 1. GET THE CUISINE

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. UPDATE THE PROMPT with the cuisine
  const cuisineInstruction =
    cuisine && cuisine !== "Any"
      ? `The recipe MUST be a ${cuisine} style dish.`
      : "You can decide the best cuisine style.";

  const prompt = `
    You are a master chef. Create a recipe using these ingredients: ${ingredients}. 
    ${cuisineInstruction}
    
    IMPORTANT: You must output ONLY valid JSON.
    Return a JSON object with this exact structure:
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
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const recipeData = JSON.parse(content);

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        cooking_time: recipeData.cooking_time,
        difficulty: recipeData.difficulty,
        is_ai_generated: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { success: true, recipeId: data.id };
  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, error: "Failed to generate recipe." };
  }
}
