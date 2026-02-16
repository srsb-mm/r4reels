import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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

// Ad component for stories
const StoryAd = ({ onComplete }: { onComplete: () => void }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Load native ad
    if (adRef.current) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl28214886.effectivegatecpm.com/0f7e60b368e48e4872332b9826d92f11/invoke.js';
      adRef.current.appendChild(script);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background">
      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
        Ad • {countdown}s
      </div>
      <div className="text-muted-foreground text-sm mb-4">Sponsored</div>
      <div ref={adRef} className="flex-1 flex items-center justify-center">
        <div id="container-0f7e60b368e48e4872332b9826d92f11"></div>
      </div>
      <button
        onClick={onComplete}
        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium"
      >
        Skip Ad
      </button>
    </div>
  );
};

const StoryViewer = ({ stories, currentIndex, onClose, onNext, onPrevious }: StoryViewerProps) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [storiesViewed, setStoriesViewed] = useState(0);
  const story = stories[currentIndex];
  const STORY_DURATION = 5000;
  const AD_FREQUENCY = 3; // Show ad after every 3 stories

  useEffect(() => {
    if (story && user) {
      checkIfLiked();
      fetchLikeCount();
    }
  }, [story?.id, user]);

  useEffect(() => {
    // Track stories viewed and show ad
    setStoriesViewed(prev => prev + 1);
  }, [currentIndex]);

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

  const handleNext = () => {
    // Check if we should show an ad
    if (storiesViewed > 0 && storiesViewed % AD_FREQUENCY === 0 && !showAd) {
      setShowAd(true);
    } else {
      onNext();
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
    onNext();
  };

  useEffect(() => {
    if (isPaused || showAd) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            handleNext();
          } else {
            onClose();
          }
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, showAd, onClose, stories.length, storiesViewed]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  if (!story) return null;

  // Show ad screen
  if (showAd) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <StoryAd onComplete={handleAdComplete} />
      </div>
    );
  }

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
            onClick={handleNext}
          />
        </div>
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
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      )}

      {/* Reply & Like Bar */}
      <StoryReplyBar storyUserId={story.user.id} />
    </div>
  );
};

const StoryReplyBar = ({ storyUserId }: { storyUserId: string }) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim() || !user || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: storyUserId,
        text: replyText.trim(),
      });
      if (error) throw error;
      toast({ title: 'Reply sent!' });
      setReplyText('');
    } catch {
      toast({ title: 'Failed to send reply', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (user?.id === storyUserId) return null;

  return (
    <div className="absolute bottom-6 left-4 right-4 flex items-center gap-2">
      <Input
        placeholder="Send message..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
        className="flex-1 bg-muted/30 border-muted text-foreground placeholder:text-muted-foreground rounded-full h-10"
      />
      <button
        onClick={handleReply}
        disabled={!replyText.trim() || sending}
        className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};

export default StoryViewer;