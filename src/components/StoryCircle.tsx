import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StoryCircleProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  hasStory: boolean;
  onClick: () => void;
}

const StoryCircle = ({ user, hasStory, onClick }: StoryCircleProps) => {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[80px]">
      <div
        className={`p-0.5 rounded-full ${
          hasStory
            ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'
            : 'bg-muted'
        }`}
      >
        <div className="p-0.5 bg-background rounded-full">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs truncate max-w-[80px]">{user.username}</span>
    </button>
  );
};

export default StoryCircle;
