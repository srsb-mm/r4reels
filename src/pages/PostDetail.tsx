import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createNotification, removeNotification } = useNotifications();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        likes:likes(count),
        user_liked:likes!inner(user_id)
      `)
      .eq('id', id)
      .eq('user_liked.user_id', user?.id || '')
      .single();

    if (!error && data) {
      setPost(data);
      setLikeCount(data.likes[0]?.count || 0);
      setIsLiked(data.user_liked?.length > 0);
      checkFollowStatus(data.user_id);
    }
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

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    setComments(data || []);
  };

  const handleLike = async () => {
    if (!user) return;

    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: id, user_id: user.id });
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleFollow = async () => {
    if (!user || !post) return;

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', post.user_id);
      setIsFollowing(false);
      toast({ title: 'Unfollowed successfully' });
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: post.user_id });
      setIsFollowing(true);
      toast({ title: 'Following successfully' });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        user_id: user.id,
        text: newComment.trim(),
      });

    if (!error) {
      setNewComment('');
      fetchComments();
      // Send comment notification to post owner
      if (post && post.user_id !== user.id) {
        createNotification(post.user_id, 'comment', id);
      }
      toast({ title: 'Comment added' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  if (!post) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg overflow-hidden border">
          <div className="grid md:grid-cols-2">
            {/* Media Section */}
            <div className="bg-black flex items-center justify-center">
              {post.post_type === 'reel' ? (
                <video
                  src={post.image_url}
                  className="w-full h-auto max-h-[600px] object-contain"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={post.image_url}
                  alt={post.caption || 'Post'}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col max-h-[600px]">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/user/${post.profiles.username}`)}>
                    <AvatarImage src={post.profiles.avatar_url} />
                    <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold cursor-pointer" onClick={() => navigate(`/user/${post.profiles.username}`)}>
                    {post.profiles.username}
                  </span>
                  {user?.id !== post.user_id && (
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      size="sm"
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {post.caption && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles.avatar_url} />
                      <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold mr-2">{post.profiles.username}</span>
                      <span>{post.caption}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(post.created_at))} ago
                      </div>
                    </div>
                  </div>
                )}
                
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles.avatar_url} />
                      <AvatarFallback>{comment.profiles.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold mr-2">{comment.profiles.username}</span>
                      <span>{comment.text}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={handleLike}>
                      <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <MessageCircle className="h-6 w-6" />
                    <button onClick={handleShare}>
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                  <Bookmark className="h-6 w-6" />
                </div>
                
                <div className="font-semibold">{likeCount} likes</div>
                
                <form onSubmit={handleComment} className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newComment.trim()}>
                    Post
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
