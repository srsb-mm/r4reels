import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Post from '@/components/Post';
import StoryCircle from '@/components/StoryCircle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchStories();
    }
  }, [user]);

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        likes (count),
        comments (count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load posts',
      });
      return;
    }

    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user?.id);

    const likedPostIds = new Set(userLikes?.map((l) => l.post_id));

    const formattedPosts = postsData?.map((post) => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      is_liked: likedPostIds.has(post.id),
    }));

    setPosts(formattedPosts || []);
  };

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, profiles:user_id (id, username, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      const uniqueUsers = Array.from(
        new Map(data.map((story) => [story.profiles.id, story.profiles])).values()
      );
      setStories(uniqueUsers);
    }
  };

  const handleLike = async (postId: string) => {
    const isLiked = posts.find((p) => p.id === postId)?.is_liked;

    if (isLiked) {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user?.id });
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user?.id });
    }
  };

  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleStoryClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Stories */}
        <div className="mb-8 border rounded-lg p-4 bg-card">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-2">
              {stories.map((story) => (
                <StoryCircle
                  key={story.id}
                  user={story}
                  hasStory={true}
                  onClick={() => handleStoryClick(story.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Feed */}
        <div className="pb-20 md:pb-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
