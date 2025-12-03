import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer = ({ stories, currentIndex, onClose, onNext, onPrevious }: StoryViewerProps) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const story = stories[currentIndex];
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (story && user) {
      checkIfLiked();
      fetchLikeCount();
    }
  }, [story?.id, user]);

  const checkIfLiked = async () => {
    if (!story || !user) return;
    const { data } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', story.id)
      .eq('user_id', user.id)
      .maybeSingle();
    setIsLiked(!!data);
  };

  const fetchLikeCount = async () => {
    if (!story) return;
    const { count } = await supabase
      .from('story_likes')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', story.id);
    setLikeCount(count || 0);
  };

  const handleLike = async () => {
    if (!story || !user) return;
    
    if (isLiked) {
      await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', story.id)
        .eq('user_id', user.id);
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      await supabase
        .from('story_likes')
        .insert({ story_id: story.id, user_id: user.id });
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            onNext();
          } else {
            onClose();
          }
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, onNext, onClose, stories.length]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex gap-1 mb-3">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.user.avatar_url} />
              <AvatarFallback>{story.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">{story.user.username}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(story.created_at).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="relative w-full h-full max-w-md mx-auto"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {story.media_type === 'image' ? (
          <img
            src={story.media_url}
            alt="Story"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={story.media_url}
            className="w-full h-full object-contain"
            autoPlay
            loop
            muted
          />
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="flex-1 cursor-pointer"
            onClick={onPrevious}
          />
          <div
            className="flex-1 cursor-pointer"
            onClick={onNext}
          />
        </div>
      </div>

      {/* Like Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <button
          onClick={handleLike}
          className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <Heart
            className={`h-8 w-8 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
            }`}
          />
        </button>
        {likeCount > 0 && (
          <span className="text-sm text-foreground font-medium">{likeCount}</span>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
      )}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      )}
    </div>
  );
};

export default StoryViewer;