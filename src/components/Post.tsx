import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PostProps {
  post: {
    id: string;
    user_id: string;
    image_url: string;
    caption?: string;
    location?: string;
    created_at: string;
    post_type?: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
    likes: any[];
    comments: any[];
    user_liked?: any[];
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const Post = ({ post, onLike, onComment }: PostProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.user_liked?.length > 0);
  const [likeCount, setLikeCount] = useState(post.likes[0]?.count || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(post.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  const commentCount = post.comments[0]?.count || 0;

  return (
    <div className="mb-6 border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/user/${post.profiles.username}`)}>
            <AvatarImage src={post.profiles.avatar_url} />
            <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold cursor-pointer" onClick={() => navigate(`/user/${post.profiles.username}`)}>
              {post.profiles.username}
            </div>
            {post.location && <div className="text-sm text-muted-foreground">{post.location}</div>}
          </div>
          <Button size="sm" variant="default">
            Follow
          </Button>
        </div>
        <button>
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Media */}
      {post.post_type === 'reel' ? (
        <video 
          src={post.image_url} 
          className="w-full cursor-pointer" 
          controls
          playsInline
          onDoubleClick={handleLike}
          onClick={(e) => {
            if ((e.target as HTMLVideoElement).paused) {
              navigate(`/post/${post.id}`);
            }
          }}
        />
      ) : (
        <img 
          src={post.image_url} 
          alt={post.caption || 'Post'} 
          className="w-full cursor-pointer" 
          onDoubleClick={handleLike}
          onClick={() => navigate(`/post/${post.id}`)}
        />
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={handleLike}>
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button onClick={() => onComment(post.id)}>
              <MessageCircle className="h-6 w-6" />
            </button>
            <button onClick={handleShare}>
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          <Bookmark className="h-6 w-6" />
        </div>

        {likeCount > 0 && (
          <div className="font-semibold mb-2">{likeCount} likes</div>
        )}

        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold mr-2">{post.profiles.username}</span>
            {post.caption}
          </div>
        )}

        {commentCount > 0 && (
          <button
            onClick={() => onComment(post.id)}
            className="text-muted-foreground text-sm mb-2 hover:text-foreground"
          >
            View all {commentCount} comments
          </button>
        )}

        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.created_at))} ago
        </div>
      </div>
    </div>
  );
};

export default Post;
