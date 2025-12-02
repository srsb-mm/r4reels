import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    // Get user's posts first
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user?.id);

    const postIds = userPosts?.map(p => p.id) || [];

    // Get likes on user's posts
    const { data: likes } = postIds.length > 0 ? await supabase
      .from('likes')
      .select(`
        created_at,
        post_id,
        profiles:user_id (username, avatar_url),
        posts:post_id (id, image_url)
      `)
      .in('post_id', postIds)
      .neq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20) : { data: [] };

    // Get comments on user's posts
    const { data: comments } = postIds.length > 0 ? await supabase
      .from('comments')
      .select(`
        created_at,
        text,
        post_id,
        profiles:user_id (username, avatar_url),
        posts:post_id (id, image_url)
      `)
      .in('post_id', postIds)
      .neq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20) : { data: [] };

    // Get new followers
    const { data: follows } = await supabase
      .from('follows')
      .select(`
        created_at,
        profiles:follower_id (username, avatar_url)
      `)
      .eq('following_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const allActivities = [
      ...(likes?.map((l) => ({ ...l, type: 'like' })) || []),
      ...(comments?.map((c) => ({ ...c, type: 'comment' })) || []),
      ...(follows?.map((f) => ({ ...f, type: 'follow' })) || []),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setActivities(allActivities);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-4 hover:bg-muted rounded-lg transition-colors">
              <Avatar>
                <AvatarImage src={activity.profiles?.avatar_url} />
                <AvatarFallback>
                  {activity.profiles?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p>
                  <span className="font-semibold">{activity.profiles?.username}</span>{' '}
                  {activity.type === 'like' && 'liked your post'}
                  {activity.type === 'comment' && `commented: ${activity.text}`}
                  {activity.type === 'follow' && 'started following you'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              {activity.posts && (
                <img
                  src={activity.posts.image_url}
                  alt="Post"
                  className="h-12 w-12 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Activity;
