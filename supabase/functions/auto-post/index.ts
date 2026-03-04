import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CAPTIONS = [
  "Another day, another adventure ✨", "Can't stop exploring 🌍",
  "This view though 🤩", "Weekend vibes 💫", "New favorite spot 📍",
  "Lost in the moment 🌅", "Morning glow ☀️", "Night life 🌃",
  "Cafe hopping ☕", "Food therapy 🍜", "Fitness check 💪",
  "Art everywhere 🎨", "Street photography 📸", "Nature healing 🌿",
  "Living for these moments 🙌", "Travel diaries ✈️", "Joy in little things 🌸",
  "Chasing dreams 💭", "Blessed 🙏", "Making memories 📷"
];

const LOCATIONS = [
  "Mumbai, India", "Goa, India", "Manali, India", "New York, USA",
  "Paris, France", "Bali, Indonesia", "Dubai, UAE", "Tokyo, Japan",
  "London, UK", "Barcelona, Spain", "Maldives", "Singapore"
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get random fake profiles (not real auth users)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .limit(50);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No profiles found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create 5-10 new posts from random fake users
    const numPosts = randomInt(5, 10);
    const newPosts: any[] = [];
    const profileIds = profiles.map(p => p.id);

    for (let i = 0; i < numPosts; i++) {
      const userId = randomFrom(profileIds);
      const isReel = Math.random() > 0.6;
      const seed = `auto-${Date.now()}-${i}`;

      newPosts.push({
        user_id: userId,
        image_url: `https://picsum.photos/seed/${seed}/1080/${isReel ? "1920" : "1080"}`,
        caption: randomFrom(CAPTIONS),
        location: Math.random() > 0.4 ? randomFrom(LOCATIONS) : null,
        post_type: isReel ? "reel" : "post",
      });
    }

    const { data: insertedPosts, error: postError } = await supabase
      .from("posts")
      .insert(newPosts)
      .select("id");

    if (postError) throw postError;

    // Add random likes to new posts
    if (insertedPosts) {
      const likes: any[] = [];
      for (const post of insertedPosts) {
        const numLikes = randomInt(20, 200);
        const likers = profileIds.sort(() => Math.random() - 0.5).slice(0, Math.min(numLikes, profileIds.length));
        for (const liker of likers) {
          likes.push({ post_id: post.id, user_id: liker });
        }
      }

      for (let i = 0; i < likes.length; i += 200) {
        const batch = likes.slice(i, i + 200);
        await supabase.from("likes").insert(batch);
      }
    }

    return new Response(
      JSON.stringify({ success: true, posts_created: numPosts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-post error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
