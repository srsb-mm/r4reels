import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FAKE_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Singh", "Vikram Joshi",
  "Sneha Reddy", "Arjun Kumar", "Kavya Nair", "Rahul Gupta", "Ishita Verma",
  "Aditya Chauhan", "Meera Iyer", "Karan Malhotra", "Diya Bose", "Nikhil Rao",
  "Pooja Deshmukh", "Siddharth Pillai", "Riya Kapoor", "Manish Tiwari", "Tanvi Shah",
  "Amit Saxena", "Neha Agarwal", "Rajesh Mishra", "Simran Kaur", "Varun Srinivasan",
  "Ankita Chatterjee", "Harsh Pandey", "Divya Menon", "Kunal Bhatt", "Swati Jain",
  "Alex Turner", "Sofia Martinez", "James Wilson", "Emma Johnson", "Liam Brown",
  "Olivia Davis", "Noah Garcia", "Ava Rodriguez", "Ethan Lee", "Mia Thompson",
  "Lucas White", "Isabella Harris", "Mason Clark", "Sophia Lewis", "Logan Walker",
  "Charlotte Hall", "Benjamin King", "Amelia Wright", "Elijah Scott", "Harper Green"
];

const CAPTIONS = [
  "Living my best life ✨", "Adventures await 🌍", "Golden hour vibes 🌅",
  "Weekend mood 💫", "Making memories 📸", "Wanderlust 🧭", "City lights ✨",
  "Beach day 🏖️", "Mountain views 🏔️", "Coffee & chill ☕",
  "Sunset chaser 🌇", "Explore more 🗺️", "Good vibes only ☀️",
  "Travel diary 📖", "Paradise found 🌴", "Road trip 🚗", "Night owl 🦉",
  "Street style 👟", "Nature lover 🌿", "Dream big 💭",
  "Life is beautiful 🌸", "Weekend getaway 🛫", "Foodie adventures 🍕",
  "Art & soul 🎨", "Fitness goals 💪", "Dance like nobody's watching 💃",
  "Rainy day vibes 🌧️", "Stargazing ⭐", "New beginnings 🌱",
  "Just breathe 🧘", "Chasing sunsets 🌅", "Ocean breeze 🌊",
  "Happy place 🏡", "Wild and free 🦋", "Positivity ✌️",
  "Grateful 🙏", "Throwback 📷", "Festival vibes 🎪",
  "Late night thoughts 🌙", "Keep it real 💯"
];

const LOCATIONS = [
  "Mumbai, India", "Delhi, India", "Goa, India", "Jaipur, India", "Manali, India",
  "New York, USA", "Paris, France", "Tokyo, Japan", "London, UK", "Dubai, UAE",
  "Bali, Indonesia", "Barcelona, Spain", "Rome, Italy", "Sydney, Australia",
  "Bangkok, Thailand", "Istanbul, Turkey", "Santorini, Greece", "Maldives",
  "Singapore", "Amsterdam, Netherlands"
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const now = Date.now();
  const past = now - daysAgo * 24 * 60 * 60 * 1000;
  const random = past + Math.random() * (now - past);
  return new Date(random).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const NUM_ACCOUNTS = 50;
    const createdUserIds: string[] = [];

    // Step 1: Create auth users (profiles auto-created by trigger)
    for (let i = 0; i < NUM_ACCOUNTS; i++) {
      const fullName = FAKE_NAMES[i];
      const username = fullName.toLowerCase().replace(/\s+/g, ".") + randomInt(1, 999);
      const email = `${username.replace(/\./g, "")}@fakeuser.r4reels.app`;

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: `FakeUser${randomInt(100000, 999999)}!`,
        email_confirm: true,
        user_metadata: {
          username,
          full_name: fullName,
          avatar_url: `https://i.pravatar.cc/300?u=${i}-${username}`,
        },
      });

      if (authError) {
        console.error(`Failed to create user ${i}:`, authError.message);
        continue;
      }

      if (authUser?.user) {
        createdUserIds.push(authUser.user.id);

        // Update profile with bio
        await supabase.from("profiles").update({
          bio: randomFrom([
            "📸 Photography | ✈️ Travel | 🌟 Life",
            "Digital creator | Content maker",
            "Living life one photo at a time 📷",
            "Explorer 🌍 | Dreamer 💭 | Creator ✨",
            "Just vibing ✌️",
            "Adventure seeker 🏔️ | Coffee lover ☕",
            "📸 | ✈️ | 🎵 | 🍕",
            "Making the world more beautiful, one post at a time",
            "Follow for daily inspiration ✨",
          ]),
          website: Math.random() > 0.7 ? `https://${username.replace(/\./g, "")}.com` : null,
        }).eq("id", authUser.user.id);
      }
    }

    console.log(`Created ${createdUserIds.length} users`);

    // Step 2: Generate posts
    const allPosts: any[] = [];
    for (const userId of createdUserIds) {
      const numPosts = randomInt(10, 20);
      for (let j = 0; j < numPosts; j++) {
        const isReel = Math.random() > 0.7;
        const seed = `${userId.slice(0, 8)}-${j}`;
        allPosts.push({
          user_id: userId,
          image_url: `https://picsum.photos/seed/${seed}/1080/${isReel ? "1920" : "1080"}`,
          caption: randomFrom(CAPTIONS),
          location: Math.random() > 0.4 ? randomFrom(LOCATIONS) : null,
          post_type: isReel ? "reel" : "post",
          created_at: randomDate(randomInt(1, 60)),
        });
      }
    }

    const BATCH = 200;
    for (let i = 0; i < allPosts.length; i += BATCH) {
      const { error } = await supabase.from("posts").insert(allPosts.slice(i, i + BATCH));
      if (error) console.error("Post batch error:", error.message);
    }

    // Step 3: Generate follows
    const allFollows: any[] = [];
    const followSet = new Set<string>();
    for (const userId of createdUserIds) {
      const numFollows = randomInt(5, 15);
      const targets = createdUserIds.filter(id => id !== userId).sort(() => Math.random() - 0.5).slice(0, numFollows);
      for (const target of targets) {
        const key = `${userId}-${target}`;
        if (!followSet.has(key)) {
          followSet.add(key);
          allFollows.push({ follower_id: userId, following_id: target, created_at: randomDate(60) });
        }
      }
    }

    for (let i = 0; i < allFollows.length; i += BATCH) {
      const { error } = await supabase.from("follows").insert(allFollows.slice(i, i + BATCH));
      if (error) console.error("Follow batch error:", error.message);
    }

    // Step 4: Generate likes (fetch post IDs first)
    const { data: postRows } = await supabase.from("posts").select("id").limit(1000);
    const postIds = postRows?.map(p => p.id) || [];

    const allLikes: any[] = [];
    const likeSet = new Set<string>();
    for (const postId of postIds) {
      const numLikes = randomInt(30, Math.min(300, createdUserIds.length));
      const likers = createdUserIds.sort(() => Math.random() - 0.5).slice(0, numLikes);
      for (const liker of likers) {
        const key = `${postId}-${liker}`;
        if (!likeSet.has(key)) {
          likeSet.add(key);
          allLikes.push({ post_id: postId, user_id: liker });
        }
      }
    }

    for (let i = 0; i < allLikes.length; i += BATCH) {
      const { error } = await supabase.from("likes").insert(allLikes.slice(i, i + BATCH));
      if (error) console.error("Like batch error:", error.message);
    }

    // Step 5: Comments on some posts
    const commentTexts = [
      "Amazing! 🔥", "Love this ❤️", "So beautiful 😍", "Goals! 🙌",
      "Wow! 🤩", "Incredible shot 📸", "This is perfect", "Need to visit here!",
      "Stunning 💫", "Great vibes ✨", "🔥🔥🔥", "❤️❤️", "Obsessed!",
      "Where is this?!", "So cool!", "Living the dream", "Pure magic ✨",
    ];

    const allComments: any[] = [];
    for (const postId of postIds.slice(0, 200)) {
      const numComments = randomInt(2, 10);
      const commenters = createdUserIds.sort(() => Math.random() - 0.5).slice(0, numComments);
      for (const commenter of commenters) {
        allComments.push({ post_id: postId, user_id: commenter, text: randomFrom(commentTexts) });
      }
    }

    for (let i = 0; i < allComments.length; i += BATCH) {
      const { error } = await supabase.from("comments").insert(allComments.slice(i, i + BATCH));
      if (error) console.error("Comment batch error:", error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          users: createdUserIds.length,
          posts: allPosts.length,
          follows: allFollows.length,
          likes: allLikes.length,
          comments: allComments.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
