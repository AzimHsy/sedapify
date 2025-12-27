"use client";

import { updateProfile } from "@/app/actions/userActions";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, User, Save, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return router.push("/login");

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setUser(data);
      setPreview(data?.avatar_url);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);

    const result = await updateProfile(formData);

    if (result.success) {
      router.push("/profile"); // Redirect back to profile after save
    } else {
      alert("Error: " + result.error);
    }
    setSaving(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-sm border border-gray-100">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-gray-500 mb-6 hover:text-orange-500 transition"
        >
          <ArrowLeft size={20} /> Back to Profile
        </Link>

        <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50">
              {preview ? (
                <Image
                  src={preview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-full h-full p-6 text-gray-300" />
              )}
            </div>
            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition shadow-sm">
              Change Photo
              <input
                type="file"
                name="avatar"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Username
            </label>
            <input
              name="username"
              defaultValue={user?.username}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={user?.bio}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition flex justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
