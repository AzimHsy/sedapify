'use client'

import { useState } from 'react'
import RecipeCard from './RecipeCard'
import RecipeModal from './RecipeModal'

// Add currentUserId to props
export default function FeedWrapper({ recipes, currentUserId }: { recipes: any[], currentUserId?: string }) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            time={recipe.cooking_time || "30 Min"}
            image={recipe.image_url} 
            views={0}
            author={recipe.users?.username} 
            authorAvatar={recipe.users?.avatar_url}
            isAiGenerated={recipe.is_ai_generated}
            cuisine={recipe.cuisine}
            mealType={recipe.meal_type} 
            dietary={recipe.dietary}
            userId={recipe.user_id}
            currentUserId={currentUserId}
            onExpand={() => setSelectedRecipe(recipe)} 
          />
        ))}
      </div>

      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          isOpen={!!selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </>
  )
}