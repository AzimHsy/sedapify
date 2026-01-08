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
  const cuisine = formData.get("cuisine") as string;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const cuisineInstruction =
    cuisine && cuisine !== "Any"
      ? `The recipe MUST be a ${cuisine} style dish.`
      : "You can decide the best cuisine style.";

  // --- PROMPT: INTENT ANALYSIS ---
  const prompt = `
    You are a master chef AI. User Input: "${ingredients}".

    TASK:
    1. ANALYZE INTENT: 
       - If the user lists ingredients (e.g., "chicken, rice"), use them.
       - If the user asks a specific question (e.g., "How to cook pasta"), extract the food item ("pasta") and generate a recipe for it.
       - If the user input is VAGUE, META, or nonsensical (e.g., "How to cook this?", "Help me", "Hello", "test"), you MUST REJECT IT.

    2. VALIDATION:
       - Input must contain specific food items or a specific dish name.
    
    OUTPUT FORMAT (JSON ONLY):
    
    CASE A: INVALID / VAGUE / NON-FOOD
    { 
      "valid": false, 
      "error": "Please specify ingredients (e.g., 'Chicken, Garlic') or a dish name." 
    }

    CASE B: VALID
    {
      "valid": true,
      "title": "Creative Recipe Name",
      "description": "Appetizing description (max 2 sentences)",
      "ingredients": ["List item 1", "List item 2"],
      "instructions": ["Step 1", "Step 2"],
      "cooking_time": "e.g. 30 mins",
      "difficulty": "Easy/Medium/Hard"
    }

    CONSTRAINT: ${cuisineInstruction}
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const recipeData = JSON.parse(content);

    // --- HANDLE REJECTION ---
    if (recipeData.valid === false) {
      return { 
        success: false, 
        error: recipeData.error || "Please enter valid food ingredients." 
      };
    }

    // --- GENERATE IMAGE ---
    const imagePrompt = encodeURIComponent(
      `Delicious ${recipeData.title}, ${recipeData.description}, professional food photography, studio lighting, 4k resolution, appetizing, plated beautifully`
    );

    const aiImageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=800&height=600&nologo=true&model=flux`;

    // --- SAVE TO DB ---
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
        image_url: aiImageUrl,
        cuisine: cuisine === "Any" ? "International" : cuisine,
        meal_type: "Dinner",
        dietary: "Standard"
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { success: true, recipeId: data.id };
  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, error: "Failed to generate recipe. Please try again." };
  }
}