import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface CommentDialogProps {
  postId: string;
  postOwnerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentDialog = ({ postId, postOwnerId, isOpen, onClose }: CommentDialogProps) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          text: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();

      if (postOwnerId !== user.id) {
        createNotification(postOwnerId, 'comment', postId);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({ title: 'Failed to post comment', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-8" />
          <h3 className="font-semibold text-base">Comments</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Drag indicator for mobile */}
        <div className="sm:hidden flex justify-center py-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Comments list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg font-semibold mb-1">No comments yet</p>
                <p className="text-sm">Start the conversation.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div>
                      <span className="font-semibold text-sm mr-2">{comment.profiles?.username}</span>
                      <span className="text-sm">{comment.text}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 self-center">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border-none bg-transparent focus-visible:ring-0 px-0"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!newComment.trim() || loading}
            className="text-primary font-semibold"
          >
            Post
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CommentDialog;
