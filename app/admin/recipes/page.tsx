import { getAdminRecipes, deleteRecipe } from '@/app/actions/adminActions' // <--- UPDATED IMPORT
import { Trash2, ExternalLink, Bot, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminRecipesPage() {
  const recipes = await getAdminRecipes()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Recipe Moderation</h1>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
          {recipes.length} Total Recipes
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Recipe</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Author</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recipes.map((recipe: any) => (
              <tr key={recipe.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 relative overflow-hidden">
                      {recipe.image_url && <Image src={recipe.image_url} alt="" fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{recipe.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{recipe.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm">{recipe.users?.username || 'Unknown'}</td>
                <td className="p-4">
                  {recipe.is_ai_generated ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold">
                      <Bot size={12} /> AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                      <User size={12} /> User
                    </span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link href={`/recipe/${recipe.id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <ExternalLink size={16} />
                  </Link>
                  
                  {/* UPDATED DELETE FORM */}
                  <form action={async () => {
                    'use server'
                    await deleteRecipe(recipe.id) // <--- Calling the new Admin Action
                  }}>
                    <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </form>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}