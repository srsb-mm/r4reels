import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, Lock, Eye, EyeOff, Shield, LogOut, Bell, Moon, Sun,
  User, Heart, HelpCircle, Info, ChevronRight, KeyRound, Globe, UserX
} from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchPrivacySettings();
  }, [user]);

  const fetchPrivacySettings = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('is_private')
      .eq('id', user?.id)
      .maybeSingle();
    if (data) setIsPrivate(data.is_private || false);
  };

  const handlePrivacyToggle = async (checked: boolean) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_private: checked })
        .eq('id', user.id);
      if (error) throw error;
      setIsPrivate(checked);
      toast({ title: checked ? 'Account is now private' : 'Account is now public' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast({ title: 'Password updated successfully' });
      setPasswords({ new: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const SettingsItem = ({ icon: Icon, label, onClick, rightElement, danger }: {
    icon: any; label: string; onClick?: () => void; rightElement?: React.ReactNode; danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${danger ? 'text-destructive' : ''}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-left text-[15px]">{label}</span>
      {rightElement || <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </button>
  );

  return (
    <Layout>
      <div className="max-w-lg mx-auto pb-20">
        {/* Header - Instagram style */}
        <div className="flex items-center gap-3 mb-2 px-1">
          <button onClick={() => navigate('/profile')} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold flex-1">Settings and activity</h1>
        </div>

        {/* Account section */}
        <div className="mt-4">
          <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your account
          </p>
          <div className="bg-card rounded-xl border overflow-hidden">
            <SettingsItem icon={User} label="Edit profile" onClick={() => navigate('/profile/edit')} />
            <Separator />
            <SettingsItem icon={KeyRound} label="Change password" onClick={() => setShowPasswordForm(!showPasswordForm)} />
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="px-4 py-3 space-y-3 bg-muted/30">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Privacy section */}
        <div className="mt-6">
          <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Privacy
          </p>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <Shield className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="text-[15px]">Private account</p>
                <p className="text-xs text-muted-foreground">Only approved followers can see your posts</p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={handlePrivacyToggle} />
            </div>
            <Separator />
            <SettingsItem icon={UserX} label="Blocked accounts" />
            <Separator />
            <SettingsItem icon={Globe} label="Account privacy" />
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-6">
          <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Notifications
          </p>
          <div className="bg-card rounded-xl border overflow-hidden">
            <SettingsItem icon={Bell} label="Push notifications" />
            <Separator />
            <SettingsItem icon={Heart} label="Activity notifications" onClick={() => navigate('/activity')} />
          </div>
        </div>

        {/* Support */}
        <div className="mt-6">
          <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            More info and support
          </p>
          <div className="bg-card rounded-xl border overflow-hidden">
            <SettingsItem icon={HelpCircle} label="Help" />
            <Separator />
            <SettingsItem icon={Info} label="About" />
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6">
          <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Login
          </p>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="text-[15px]">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <SettingsItem icon={LogOut} label="Log out" onClick={handleSignOut} danger />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
