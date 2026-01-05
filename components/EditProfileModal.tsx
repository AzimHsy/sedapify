'use client'

import { useState } from 'react'
import { X, Upload, Loader2, User, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { updateProfile } from '@/app/actions/userActions'

interface EditProfileModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export default function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(user.avatar_url)

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await updateProfile(formData)
    
    setLoading(false)
    if (result.success) {
      onClose() // Close modal on success
    } else {
      alert("Error updating profile")
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 mb-3 group cursor-pointer">
                {preview ? (
                  <Image src={preview} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <User size={32} />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                   <Upload className="text-white" size={24} />
                </div>
                
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-gray-500">Change photo</p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                    <input 
                        name="username" 
                        defaultValue={user.username} 
                        className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none transition bg-transparent font-medium"
                        placeholder="Username"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bio</label>
                    <textarea 
                        name="bio" 
                        defaultValue={user.bio} 
                        className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none transition bg-transparent resize-none min-h-[80px]"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                {/* --- NEW FIELDS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dietary Preference</label>
                        <div className="relative">
                            <select 
                                name="dietary_pref" 
                                defaultValue={user.dietary_pref || "Standard"}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
                            >
                                <option value="Standard">Standard</option>
                                <option value="Halal">Halal</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cooking Level</label>
                        <div className="relative">
                            <select 
                                name="cooking_level" 
                                defaultValue={user.cooking_level || "Beginner"}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Home Cook</option>
                                <option value="Master">Pro Chef</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                    </div>
                </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-3 font-bold text-gray-700 cursor-pointer hover:bg-gray-50 rounded-xl transition"
          >
            Cancel
          </button> 
          <button 
            type="submit" 
            form="edit-form"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 cursor-pointer rounded-xl font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save"}
          </button>
        </div>

      </div>
    </div>
  )
}