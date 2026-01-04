import { createClient } from "@/lib/supabase/server";
import ReelsItem from "@/components/ReelsItem";
import { Film } from "lucide-react";

export default async function ReelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Videos (Randomized or Latest)
  // Note: For true random, you usually use a DB function. Here we fetch latest 20.
  const { data: videos } = await supabase
    .from("cooking_videos")
    .select(`
        *,
        users (username, avatar_url),
        recipes (id, title)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="h-screen bg-[#FDF8F0] flex flex-col items-center overflow-hidden">
      
      {/* Mobile Header (Hidden on Desktop if sidebar exists, but good to have) */}
      <div className="md:hidden absolute top-0 left-0 w-full p-4 z-50 flex justify-center text-black font-bold bg-gradient-to-b from-[#FDF8F0] to-transparent pointer-events-none">
        <span className="flex items-center gap-2"><Film size={18} /> Reels</span>
      </div>

      {/* --- SCROLL CONTAINER --- */}
      {/* 'snap-y snap-mandatory' creates the TikTok scroll effect */}
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
        
        {videos && videos.length > 0 ? (
            videos.map((video) => (
                <ReelsItem 
                    key={video.id} 
                    video={video} 
                    currentUserId={user?.id}
                />
            ))
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-black">
                <Film size={48} className="mb-4 opacity-50" />
                <p>No reels available yet.</p>
            </div>
        )}

      </div>
    </div>
  );
}