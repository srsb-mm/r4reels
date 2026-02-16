import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Post from '@/components/Post';
import StoryCircle from '@/components/StoryCircle';
import StoryViewer from '@/components/StoryViewer';
import AdBanner from '@/components/AdBanner';
import StoryUploadDialog from '@/components/StoryUploadDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryUser, setCurrentStoryUser] = useState<any>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [showStoryUpload, setShowStoryUpload] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchStories();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();
    
    if (data) setUserProfile(data);
  };

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
    // Get users the current user follows
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user?.id);

    // Get users who follow the current user
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', user?.id);

    const connectedUserIds = new Set<string>();
    following?.forEach(f => connectedUserIds.add(f.following_id));
    followers?.forEach(f => connectedUserIds.add(f.follower_id));
    // Include own user id to see own stories
    if (user?.id) connectedUserIds.add(user.id);

    const { data, error } = await supabase
      .from('stories')
      .select('*, profiles:user_id (id, username, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', Array.from(connectedUserIds))
      .order('created_at', { ascending: false });

    if (!error && data) {
      const storiesGrouped = data.reduce((acc: any, story: any) => {
        const userId = story.profiles.id;
        if (!acc[userId]) {
          acc[userId] = {
            user: story.profiles,
            stories: []
          };
        }
        acc[userId].stories.push(story);
        return acc;
      }, {});

      setStories(Object.values(storiesGrouped));
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

  const handleStoryClick = (storyGroup: any, index: number) => {
    setCurrentStoryUser(storyGroup);
    setCurrentStoryIndex(0);
    setUserStories(storyGroup.stories.map((s: any) => ({
      ...s,
      user: storyGroup.user
    })));
    setShowStoryViewer(true);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Find next user with stories
      const currentUserIndex = stories.findIndex((s: any) => s.user.id === currentStoryUser?.user.id);
      if (currentUserIndex < stories.length - 1) {
        handleStoryClick(stories[currentUserIndex + 1], 0);
      } else {
        setShowStoryViewer(false);
      }
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Find previous user with stories
      const currentUserIndex = stories.findIndex((s: any) => s.user.id === currentStoryUser?.user.id);
      if (currentUserIndex > 0) {
        const prevStories = stories[currentUserIndex - 1];
        setCurrentStoryUser(prevStories);
        setUserStories(prevStories.stories.map((s: any) => ({
          ...s,
          user: prevStories.user
        })));
        setCurrentStoryIndex(prevStories.stories.length - 1);
      }
    }
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
              {/* Your Story */}
              <button
                onClick={() => setShowStoryUpload(true)}
                className="flex flex-col items-center gap-1 min-w-[80px]"
              >
                <div className="relative">
                  <div className="p-0.5 rounded-full bg-muted">
                    <div className="p-0.5 bg-background rounded-full">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback>{userProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs truncate max-w-[80px]">Your Story</span>
              </button>

              {/* Other Stories */}
              {stories.map((storyGroup: any, index) => (
                <StoryCircle
                  key={storyGroup.user.id}
                  user={storyGroup.user}
                  hasStory={true}
                  onClick={() => handleStoryClick(storyGroup, index)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Feed */}
        <div className="pb-20 md:pb-6">
          {posts.map((post, index) => (
            <div key={post.id}>
              <Post
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
              {/* Show ad after every 3rd post */}
              {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                <AdBanner type={index % 6 === 2 ? 'native' : 'banner'} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {showStoryViewer && userStories.length > 0 && (
        <StoryViewer
          stories={userStories}
          currentIndex={currentStoryIndex}
          onClose={() => setShowStoryViewer(false)}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}

      <StoryUploadDialog
        open={showStoryUpload}
        onOpenChange={setShowStoryUpload}
        onUploaded={fetchStories}
      />
    </Layout>
  );
};

export default Home;