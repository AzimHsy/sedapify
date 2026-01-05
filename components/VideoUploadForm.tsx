'use client'
import { useState } from 'react'
import { uploadVideoAction } from '@/app/actions/videoActions'
import { Loader2, Upload, Video, ArrowLeft, Film, Link as LinkIcon, FileVideo } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VideoUploadForm({ myRecipes }: { myRecipes: any[] }) {
  const [loading, setLoading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await uploadVideoAction(formData)
    
    if (result?.error) {
        alert(result.error)
        setLoading(false)
    } else {
        router.push('/discover')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-[#FDF8F0] to-orange-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/discover" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition font-medium"
          >
            <ArrowLeft size={20} /> Back to Discover
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
              <Video size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Upload Chef Videos
            </h1>
            <p className="text-lg text-gray-600">
              Share your cooking process with the community
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Video Upload Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileVideo size={20} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Video File</h2>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-all duration-300 group bg-gray-50">
                <input 
                  type="file" 
                  name="video" 
                  accept="video/mp4,video/quicktime" 
                  required 
                  id="video-upload"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="video-upload" className="cursor-pointer block">
                  {videoFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <Film size={28} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{videoFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setVideoFile(null)
                          const input = document.getElementById('video-upload') as HTMLInputElement
                          if (input) input.value = ''
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Change video
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload size={28} className="text-orange-600" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-gray-700">Click to upload video</span>
                        <p className="text-sm text-gray-500 mt-1">MP4 or MOV (Vertical format recommended)</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Caption Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Film size={20} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Caption</h2>
              </div>

              <textarea 
                name="caption" 
                required 
                placeholder="What are you cooking? Share your story..."
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none" 
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Add hashtags like #quickrecipe #malaysianfood to reach more people
              </p>
            </div>

            {/* Linked Recipe Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <LinkIcon size={20} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Link Recipe</h2>
              </div>

              <select 
                name="linkedRecipeId" 
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white transition-all text-gray-900 cursor-pointer"
              >
                <option value="none">No linked recipe</option>
                {myRecipes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">✨ Optional:</span> Link this video to one of your recipes. Viewers can click to see the full recipe details!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={24} />
                  Upload Video
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              By uploading, you agree to our Community Guidelines
            </p>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">📱</span> Tips for Great Chef Shorts
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Keep videos under 60 seconds for maximum engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Film in vertical (9:16) format for best mobile viewing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Show the cooking process clearly with good lighting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>Add engaging captions to tell your story</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}