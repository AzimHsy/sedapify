'use server'

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

export async function improveTextAction(text: string, type: 'ingredient' | 'instruction') {
  if (!text || text.length < 3) return { refined: text }

  // PROMPT: Supports Multi-language
  const systemPrompt = type === 'ingredient' 
    ? "You are an expert culinary editor. Detect the language of the input. Fix typos, standardize units (e.g., '2 cawan' -> '2 cawan'), and improve formatting. IMPORTANT: Output the result IN THE SAME LANGUAGE as the input. Return ONLY the corrected text."
    : "You are an expert culinary editor. Detect the language of the input. Rewrite the step to be clear, concise, and grammatically correct. IMPORTANT: Output the result IN THE SAME LANGUAGE as the input. Return ONLY the corrected text."

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
    })

    return { refined: completion.choices[0].message.content || text }
  } catch (error) {
    console.error("AI Fix Error:", error)
    return { refined: text, error: "Failed to improve text" }
  }
}