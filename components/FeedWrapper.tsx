'use client'

import { useState } from 'react'
import RecipeCard from './RecipeCard'
import RecipeModal from './RecipeModal'

export default function FeedWrapper({ recipes }: { recipes: any[] }) {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  return (
    <>
      {/* The Grid */}
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
            // OPEN MODAL ON CLICK
            onExpand={() => setSelectedRecipe(recipe)} 
          />
        ))}
      </div>

      {/* The Modal */}
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