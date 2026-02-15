import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor?: {
    username: string;
    avatar_url: string | null;
  };
  post?: {
    image_url: string;
  } | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data) return;

    // Fetch actor profiles
    const actorIds = [...new Set(data.map(n => n.actor_id))];
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', actorIds);

    // Fetch related posts
    const postIds = data.filter(n => n.post_id).map(n => n.post_id!);
    const { data: posts } = postIds.length > 0
      ? await supabase.from('posts').select('id, image_url').in('id', postIds)
      : { data: [] };

    const enriched: Notification[] = data.map(n => ({
      ...n,
      actor: actors?.find(a => a.id === n.actor_id) || undefined,
      post: posts?.find(p => p.id === n.post_id) || null,
    }));

    setNotifications(enriched);
    setUnreadCount(enriched.filter(n => !n.read).length);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Create a notification (called when liking/following)
  const createNotification = async (targetUserId: string, type: string, postId?: string) => {
    if (!user || targetUserId === user.id) return;
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      actor_id: user.id,
      type,
      post_id: postId || null,
    });
  };

  // Remove notification (e.g. on unlike/unfollow)
  const removeNotification = async (targetUserId: string, type: string, postId?: string) => {
    if (!user) return;
    let query = supabase
      .from('notifications')
      .delete()
      .eq('user_id', targetUserId)
      .eq('actor_id', user.id)
      .eq('type', type);
    if (postId) query = query.eq('post_id', postId);
    await query;
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  return { notifications, unreadCount, markAllRead, createNotification, removeNotification, fetchNotifications };
};
