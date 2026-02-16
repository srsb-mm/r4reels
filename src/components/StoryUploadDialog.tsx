import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';

interface StoryUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

const StoryUploadDialog = ({ open, onOpenChange, onUploaded }: StoryUploadDialogProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('stories').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(filePath);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

      const { error: insertError } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaType,
      });
      if (insertError) throw insertError;

      toast({ title: 'Story added!' });
      setFile(null);
      setPreview('');
      onOpenChange(false);
      onUploaded();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              {file?.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" className="w-full rounded-lg max-h-80 object-cover" />
              ) : (
                <video src={preview} controls className="w-full rounded-lg max-h-80" />
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => { setFile(null); setPreview(''); }}>
                Change
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
              <Camera className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Tap to select photo or video</span>
              <Input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          {file && (
            <Button className="w-full" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Sharing...' : 'Share to Story'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryUploadDialog;
