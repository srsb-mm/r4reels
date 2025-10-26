import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Search = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchFollowing = async () => {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user?.id || '');

    const followingSet = new Set(data?.map(f => f.following_id) || []);
    setFollowing(followingSet);
  };

  const searchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(20);

    setUsers(data || []);
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    if (following.has(userId)) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast({ title: 'Unfollowed successfully' });
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });
      
      setFollowing(prev => new Set(prev).add(userId));
      toast({ title: 'Following successfully' });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {users.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => navigate(`/user/${profile.username}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{profile.username}</div>
                  {profile.full_name && (
                    <div className="text-sm text-muted-foreground">{profile.full_name}</div>
                  )}
                </div>
              </div>
              {profile.id !== user.id && (
                <Button
                  variant={following.has(profile.id) ? 'outline' : 'default'}
                  onClick={() => handleFollow(profile.id)}
                >
                  {following.has(profile.id) ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          ))}
        </div>

        {searchQuery && users.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No users found
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
