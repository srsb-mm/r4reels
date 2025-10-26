import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileData) {
      setProfile(profileData);
      fetchPosts(profileData.id);
      fetchStats(profileData.id);
      checkFollowStatus(profileData.id);
    }
  };

  const fetchPosts = async (userId: string) => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setPosts(data || []);
  };

  const fetchStats = async (userId: string) => {
    const [postsCount, followersCount, followingCount] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
      supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
    ]);

    setStats({
      posts: postsCount.count || 0,
      followers: followersCount.count || 0,
      following: followingCount.count || 0,
    });
  };

  const checkFollowStatus = async (userId: string) => {
    if (!user || userId === user.id) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id);
      setIsFollowing(false);
      toast({ title: 'Unfollowed successfully' });
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
      toast({ title: 'Following successfully' });
    }
    fetchStats(profile.id);
  };

  const fetchFollowers = async () => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('follows')
      .select('follower_id, profiles:follower_id(id, username, avatar_url, full_name)')
      .eq('following_id', profile.id);

    setFollowers(data?.map(f => f.profiles) || []);
    setShowFollowers(true);
  };

  const fetchFollowingList = async () => {
    if (!profile) return;
    
    const { data } = await supabase
      .from('follows')
      .select('following_id, profiles:following_id(id, username, avatar_url, full_name)')
      .eq('follower_id', profile.id);

    setFollowingList(data?.map(f => f.profiles) || []);
    setShowFollowing(true);
  };

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-4xl">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold">{profile.username}</h1>
                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    View My Profile
                  </Button>
                ) : (
                  <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <div className="font-semibold">{stats.posts}</div>
                  <div className="text-sm text-muted-foreground">posts</div>
                </div>
                <button onClick={fetchFollowers} className="text-center hover:opacity-75">
                  <div className="font-semibold">{stats.followers}</div>
                  <div className="text-sm text-muted-foreground">followers</div>
                </button>
                <button onClick={fetchFollowingList} className="text-center hover:opacity-75">
                  <div className="font-semibold">{stats.following}</div>
                  <div className="text-sm text-muted-foreground">following</div>
                </button>
              </div>

              {profile.full_name && (
                <div className="font-semibold mb-1">{profile.full_name}</div>
              )}
              {profile.bio && <div className="text-sm mb-1">{profile.bio}</div>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {profile.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="tagged" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Tagged
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <img
                    src={post.image_url}
                    alt={post.caption || 'Post'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tagged" className="mt-6">
            <div className="text-center text-muted-foreground py-8">
              No tagged posts yet
            </div>
          </TabsContent>
        </Tabs>

        {/* Followers Dialog */}
        <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Followers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {followers.map((follower: any) => (
                <div key={follower.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => {
                    setShowFollowers(false);
                    navigate(`/user/${follower.username}`);
                  }}>
                    <AvatarImage src={follower.avatar_url} />
                    <AvatarFallback>{follower.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 cursor-pointer" onClick={() => {
                    setShowFollowers(false);
                    navigate(`/user/${follower.username}`);
                  }}>
                    <div className="font-semibold">{follower.username}</div>
                    {follower.full_name && (
                      <div className="text-sm text-muted-foreground">{follower.full_name}</div>
                    )}
                  </div>
                </div>
              ))}
              {followers.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No followers yet</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Following Dialog */}
        <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Following</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {followingList.map((following: any) => (
                <div key={following.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => {
                    setShowFollowing(false);
                    navigate(`/user/${following.username}`);
                  }}>
                    <AvatarImage src={following.avatar_url} />
                    <AvatarFallback>{following.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 cursor-pointer" onClick={() => {
                    setShowFollowing(false);
                    navigate(`/user/${following.username}`);
                  }}>
                    <div className="font-semibold">{following.username}</div>
                    {following.full_name && (
                      <div className="text-sm text-muted-foreground">{following.full_name}</div>
                    )}
                  </div>
                </div>
              ))}
              {followingList.length === 0 && (
                <div className="text-center text-muted-foreground py-4">Not following anyone yet</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UserProfile;
