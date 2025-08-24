import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings as SettingsIcon,
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Palette
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ui/theme-toggle';


interface UserSettings {
  displayName: string;
  email: string;
  currency: string;
  language: string;
  timezone: string;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayNameTimeout, setDisplayNameTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  // Note: Theme is managed by ThemeContext and persisted in localStorage
  // We no longer sync theme from database to avoid conflicts





  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      // Load user profile data from Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

             if (profile) {
         setSettings(prev => ({
           ...prev,
           displayName: profile.display_name || '',
           currency: profile.currency || 'USD',
           language: profile.language || 'en',
           timezone: profile.timezone || 'UTC',
         }));
       }

      setSettings(prev => ({
        ...prev,
        email: user.email || '',
      }));
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load settings.",
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
              const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            display_name: settings.displayName,
            currency: settings.currency,
            language: settings.language,
            timezone: settings.timezone,
            updated_at: new Date().toISOString(),
          });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDisplayName = async (displayName: string) => {
    if (!user) return;
    
    console.log('Saving display name:', displayName); // Debug log
    setIsAutoSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Display name saved successfully'); // Debug log
      
      // Update the local state to reflect the saved display name
      setSettings(prev => ({
        ...prev,
        displayName: displayName
      }));
      
      // Force a re-render by updating the component state
      setSettings(prev => ({ ...prev }));
      
      toast({
        title: "Display name updated",
        description: "Your display name has been saved.",
      });
    } catch (error: any) {
      console.error('Error saving display name:', error);
      toast({
        title: "Error",
        description: "Failed to save display name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleDisplayNameChange = (value: string) => {
    console.log('Display name changed to:', value); // Debug log
    setSettings(prev => ({ ...prev, displayName: value }));
    
    // Clear existing timeout
    if (displayNameTimeout) {
      clearTimeout(displayNameTimeout);
    }
    
    // Set new timeout to auto-save after 2 seconds of no typing
    const timeout = setTimeout(() => {
      console.log('Auto-save timeout triggered for:', value); // Debug log
      if (value.trim() !== '') {
        saveDisplayName(value);
      }
    }, 2000);
    
    setDisplayNameTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (displayNameTimeout) {
        clearTimeout(displayNameTimeout);
      }
    };
  }, []); // Remove displayNameTimeout dependency to avoid recreation

  const updatePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    // Double confirmation for safety
    const firstConfirm = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!firstConfirm) return;
    
    const secondConfirm = confirm('This will permanently delete all your data including transactions, budgets, and settings. Are you absolutely sure?');
    if (!secondConfirm) return;

    setIsLoading(true);
    try {
      // First, delete all user data from the database
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete transactions
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('Error deleting transactions:', transactionsError);
      }

      // Delete debts
      const { error: debtsError } = await supabase
        .from('debts')
        .delete()
        .eq('user_id', user.id);

      if (debtsError) {
        console.error('Error deleting debts:', debtsError);
      }

      // Delete user data and sign out (admin deletion requires backend)
      await signOut();
      toast({
        title: "Account deletion initiated",
        description: "Your data has been deleted and you have been signed out. Please contact support to complete account deletion if needed.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    // First try to use the saved display name from settings
    if (settings.displayName && settings.displayName.trim() !== '') {
      return settings.displayName;
    }
    
    // Fallback to email-based name if no display name is set
    if (!user?.email) return 'User';
    const email = user.email;
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  };



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to access settings.
              </p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
                     <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            
            
            <TabsTrigger value="account" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {getUserDisplayName().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getUserDisplayName()}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                     <Label htmlFor="displayName">Display Name</Label>
                     <div className="flex gap-2">
                       <Input
                         id="displayName"
                         value={settings.displayName}
                         onChange={(e) => handleDisplayNameChange(e.target.value)}
                         placeholder="Enter your display name"
                         className="flex-1"
                       />
                       <Button 
                         onClick={() => saveDisplayName(settings.displayName)}
                         disabled={!settings.displayName.trim()}
                         size="sm"
                       >
                         Save
                       </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       {isAutoSaving ? 'Saving...' : 'Auto-saves after 2 seconds, or click Save to save immediately'}
                     </p>
                   </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={settings.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                                     <div className="space-y-2">
                     <Label htmlFor="timezone">Timezone</Label>
                     <Select
                       value={settings.timezone}
                       onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {timezones.map((tz) => (
                           <SelectItem key={tz} value={tz}>
                             {tz}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label>Theme</Label>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Palette className="h-4 w-4" />
                         <span className="text-sm text-muted-foreground">Choose your preferred theme</span>
                       </div>
                       <ThemeToggle />
                     </div>
                   </div>

                   
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          

          

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button 
                  onClick={updatePassword}
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sign Out</Label>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account
                    </p>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={deleteAccount}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={saveSettings}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
