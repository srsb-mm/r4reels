import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Volume2, VolumeX, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdBanner from '@/components/AdBanner';
import { useNotifications } from '@/hooks/useNotifications';

const Reels = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [followingMap, setFollowingMap] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const { createNotification, removeNotification } = useNotifications();
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReels();
      fetchFollowing();
    }
  }, [user]);

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    if (data) {
      setFollowingMap(new Set(data.map(f => f.following_id)));
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user || followLoading) return;
    setFollowLoading(userId);
    const isFollowing = followingMap.has(userId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
      setFollowingMap(prev => { const n = new Set(prev); n.delete(userId); return n; });
      removeNotification(userId, 'follow');
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: userId });
      setFollowingMap(prev => new Set(prev).add(userId));
      createNotification(userId, 'follow');
    }
    setFollowLoading(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / windowHeight);
      
      if (newIndex !== currentIndex && newIndex < reels.length) {
        setCurrentIndex(newIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentIndex, reels.length]);

  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const index = parseInt(key);
      const video = videoRefs.current[index];
      if (video) {
        if (index === currentIndex) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const fetchReels = async () => {
    const { data: reelsData } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('post_type', 'reel')
      .order('created_at', { ascending: false });

    if (!reelsData) {
      setReels([]);
      return;
    }

    // Fetch likes and comments count separately
    const reelsWithData = await Promise.all(
      reelsData.map(async (reel) => {
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', reel.id);

        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', reel.id);

        const { data: userLiked } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', reel.id)
          .eq('user_id', user?.id || '')
          .maybeSingle();

        return {
          ...reel,
          likes: [{ count: likesCount || 0 }],
          comments: [{ count: commentsCount || 0 }],
          user_liked: userLiked ? [userLiked] : []
        };
      })
    );

    setReels(reelsWithData);
  };

  const handleLike = async (reel: any, index: number) => {
    if (!user) return;

    const isLiked = reel.user_liked?.length > 0;

    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', reel.id).eq('user_id', user.id);
      removeNotification(reel.user_id, 'like', reel.id);
    } else {
      await supabase.from('likes').insert({ post_id: reel.id, user_id: user.id });
      createNotification(reel.user_id, 'like', reel.id);
    }

    fetchReels();
  };

  const handleShare = async (reel: any) => {
    const url = `${window.location.origin}/post/${reel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied to clipboard' });
      }
    } catch (error) {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-white text-xl font-semibold">Reels</h1>
        <button onClick={() => navigate('/')}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Reels */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {reels.map((reel, index) => {
          const isLiked = reel.user_liked?.length > 0;
          const likeCount = reel.likes[0]?.count || 0;
          const commentCount = reel.comments[0]?.count || 0;
          const actualIndex = index + Math.floor(index / 4); // Account for ad slots

          return (
            <>
              <div
                key={reel.id}
                className="snap-start h-screen w-full relative flex items-center justify-center"
              >
                {/* Video */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={reel.image_url}
                  className="h-full w-full object-contain"
                  loop
                  muted={muted}
                  playsInline
                  autoPlay={index === 0}
                  onClick={() => {
                    const video = videoRefs.current[index];
                    if (video) {
                      if (video.paused) video.play();
                      else video.pause();
                    }
                  }}
                  onError={(e) => {
                    console.error('Video load error:', e);
                    console.error('Video URL:', reel.image_url);
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60">
                  {/* User Info */}
                  <div className="absolute bottom-20 left-4 right-20 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 border-2 border-white cursor-pointer" onClick={() => navigate(`/user/${reel.profiles.username}`)}>
                        <AvatarImage src={reel.profiles.avatar_url} />
                        <AvatarFallback>{reel.profiles.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold cursor-pointer" onClick={() => navigate(`/user/${reel.profiles.username}`)}>
                        {reel.profiles.username}
                      </span>
                      {user?.id !== reel.user_id && (
                        <Button 
                          size="sm" 
                          variant={followingMap.has(reel.user_id) ? "outline" : "default"}
                          className={followingMap.has(reel.user_id) ? "text-white border-white" : ""}
                          onClick={() => handleFollow(reel.user_id)}
                          disabled={followLoading === reel.user_id}
                        >
                          {followingMap.has(reel.user_id) ? 'Following' : 'Follow'}
                        </Button>
                      )}
                    </div>
                    {reel.caption && <p className="text-sm">{reel.caption}</p>}
                    {reel.location && <p className="text-xs text-gray-300 mt-1">📍 {reel.location}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6">
                    <button onClick={() => handleLike(reel, index)} className="flex flex-col items-center">
                      <Heart className={`h-7 w-7 text-white ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-white text-xs mt-1">{likeCount}</span>
                    </button>
                    
                    <button onClick={() => navigate(`/post/${reel.id}`)} className="flex flex-col items-center">
                      <MessageCircle className="h-7 w-7 text-white" />
                      <span className="text-white text-xs mt-1">{commentCount}</span>
                    </button>
                    
                    <button onClick={() => handleShare(reel)} className="flex flex-col items-center">
                      <Share2 className="h-7 w-7 text-white" />
                    </button>
                    
                    <button className="flex flex-col items-center">
                      <Bookmark className="h-7 w-7 text-white" />
                    </button>

                    <button onClick={() => setMuted(!muted)} className="flex flex-col items-center">
                      {muted ? <VolumeX className="h-7 w-7 text-white" /> : <Volume2 className="h-7 w-7 text-white" />}
                    </button>

                    <button className="flex flex-col items-center">
                      <MoreHorizontal className="h-7 w-7 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Show ad after every 4th reel */}
              {(index + 1) % 4 === 0 && index < reels.length - 1 && (
                <div key={`ad-${index}`} className="snap-start h-screen w-full flex items-center justify-center bg-black">
                  <AdBanner type={index % 8 === 3 ? 'native' : 'banner'} />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Reels;
