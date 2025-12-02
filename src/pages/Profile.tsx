import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Bookmark, User as UserIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPosts();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    setProfile(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    setPosts(data || []);
  };

  const fetchStats = async () => {
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user?.id);

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user?.id);

    setStats({
      posts: postsCount || 0,
      followers: followersCount || 0,
      following: followingCount || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const fetchFollowers = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('follows')
      .select('follower_id, profiles:follower_id(id, username, avatar_url, full_name)')
      .eq('following_id', user.id);

    setFollowers(data?.map(f => f.profiles) || []);
    setShowFollowers(true);
  };

  const fetchFollowingList = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('follows')
      .select('following_id, profiles:following_id(id, username, avatar_url, full_name)')
      .eq('follower_id', user.id);

    setFollowingList(data?.map(f => f.profiles) || []);
    setShowFollowing(true);
  };

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-xl font-semibold mb-4">Profile not found</h2>
          <p className="text-muted-foreground mb-4">Please log out and log in again to create your profile.</p>
          <Button onClick={handleSignOut}>Log Out</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <Avatar className="h-32 w-32 md:h-40 md:w-40">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-4xl">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-light">{profile.username}</h1>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Log Out
              </Button>
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

            <div>
              <p className="font-semibold">{profile.full_name}</p>
              {profile.bio && <p className="mt-1">{profile.bio}</p>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="tagged" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
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
          
          <TabsContent value="saved" className="mt-6">
            <div className="text-center text-muted-foreground py-8">
              No saved posts yet
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

export default Profile;
