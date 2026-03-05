import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Phone, Video, Info, Image, Mic, Heart, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (targetUserId && user) {
      fetchUserAndOpenChat(targetUserId);
    }
  }, [searchParams, user]);

  const fetchUserAndOpenChat = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      setSelectedUser(data);
      setShowMobileChat(true);
    }
  };

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages(selectedUser.id);
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (id, username, avatar_url),
        recipient:profiles!messages_recipient_id_fkey (id, username, avatar_url)
      `)
      .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
      .order('created_at', { ascending: false });

    const uniqueUsers = new Map();
    data?.forEach((msg: any) => {
      const otherUser = msg.sender?.id === user?.id ? msg.recipient : msg.sender;
      if (otherUser && !uniqueUsers.has(otherUser.id)) {
        uniqueUsers.set(otherUser.id, {
          ...otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.created_at,
        });
      }
    });
    setConversations(Array.from(uniqueUsers.values()));
  };

  const fetchMessages = async (otherUserId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`*, sender:profiles!messages_sender_id_fkey (username, avatar_url)`)
      .or(
        `and(sender_id.eq.${user?.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user?.id})`
      )
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.sender_id === selectedUser?.id || payload.new.recipient_id === selectedUser?.id) {
          setMessages((prev) => [...prev, payload.new]);
        }
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: selectedUser.id,
      text: newMessage,
    });
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(c =>
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectUser = (conv: any) => {
    setSelectedUser(conv);
    setShowMobileChat(true);
  };

  const goBackToList = () => {
    setShowMobileChat(false);
    setSelectedUser(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] h-full border rounded-lg overflow-hidden bg-card">

          {/* Left Panel - Conversations */}
          <div className={`border-r flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="pl-9 bg-muted/50 border-none rounded-xl h-9 text-sm"
                />
              </div>
            </div>

            {/* Conversation list */}
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No messages yet
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectUser(conv)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                      selectedUser?.id === conv.id ? 'bg-muted/70' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={conv.avatar_url} />
                        <AvatarFallback className="text-lg">{conv.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm">{conv.username}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          · {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Right Panel - Chat */}
          <div className={`flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={goBackToList} className="md:hidden">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/user/${selectedUser.username}`)}>
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback>{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{selectedUser.username}</p>
                      <p className="text-xs text-green-500">Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button><Phone className="h-5 w-5 text-foreground" /></button>
                    <button><Video className="h-5 w-5 text-foreground" /></button>
                    <button><Info className="h-5 w-5 text-foreground" /></button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-4">
                  <div className="py-4 space-y-1">
                    {/* Profile info at top of chat */}
                    <div className="flex flex-col items-center py-6 mb-4">
                      <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={selectedUser.avatar_url} />
                        <AvatarFallback className="text-2xl">{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold">{selectedUser.username}</p>
                      <p className="text-xs text-muted-foreground mb-3">R4 · {selectedUser.username}</p>
                      <button
                        onClick={() => navigate(`/user/${selectedUser.username}`)}
                        className="text-sm font-semibold bg-muted px-4 py-1.5 rounded-lg hover:bg-muted/80"
                      >
                        View profile
                      </button>
                    </div>

                    {messages.map((msg, i) => {
                      const isMine = msg.sender_id === user?.id;
                      const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMine && (
                            <div className="w-7">
                              {showAvatar && (
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={selectedUser.avatar_url} />
                                  <AvatarFallback className="text-xs">{selectedUser.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[65%] px-3 py-2 text-sm ${
                              isMine
                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                                : 'bg-muted rounded-2xl rounded-bl-md'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Bar - Instagram style */}
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-1 border">
                    <button className="flex-shrink-0">
                      <Image className="h-5 w-5 text-primary" />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Message..."
                      className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                    />
                    {newMessage.trim() ? (
                      <button onClick={sendMessage} className="text-primary font-semibold text-sm flex-shrink-0">
                        Send
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button><Mic className="h-5 w-5" /></button>
                        <button><Heart className="h-5 w-5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="h-24 w-24 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                  <Send className="h-10 w-10 -rotate-45" />
                </div>
                <h3 className="text-xl font-semibold mb-1">Your messages</h3>
                <p className="text-sm text-muted-foreground mb-4">Send private messages to a friend</p>
                <button
                  onClick={() => navigate('/search')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                >
                  Send message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
