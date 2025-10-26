import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Create = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [postType, setPostType] = useState<'post' | 'reel'>('post');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'post' | 'reel') => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPostType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);

    try {
      const bucket = 'posts';
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        image_url: publicUrl,
        caption,
        location,
        post_type: postType,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: `${postType === 'post' ? 'Post' : 'Reel'} created successfully!`,
      });

      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New {postType === 'post' ? 'Post' : 'Reel'}</CardTitle>
            <CardDescription>Share a {postType === 'post' ? 'photo' : 'video'} with your followers</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="post" className="w-full" onValueChange={(v) => setPostType(v as 'post' | 'reel')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="post" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Post
                </TabsTrigger>
                <TabsTrigger value="reel" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Reel
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="file">{postType === 'post' ? 'Image' : 'Video'}</Label>
                  {preview ? (
                    <div className="mt-2">
                      {postType === 'post' ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full max-h-96 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={preview}
                          controls
                          className="w-full max-h-96 rounded-lg"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setPreview('');
                        }}
                        className="mt-2"
                      >
                        Change {postType === 'post' ? 'Image' : 'Video'}
                      </Button>
                    </div>
                  ) : (
                    <Input
                      id="file"
                      type="file"
                      accept={postType === 'post' ? 'image/*' : 'video/*'}
                      onChange={(e) => handleFileChange(e, postType)}
                      required
                      className="mt-2"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : `Share ${postType === 'post' ? 'Post' : 'Reel'}`}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Create;
