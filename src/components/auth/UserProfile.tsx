import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Shield } from 'lucide-react';

export const UserProfile = () => {
  const { user, signOut, isStaySignedInEnabled } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return null;
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {getUserInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
                          <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  {isStaySignedInEnabled() && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Stay signed in enabled
                    </Badge>
                  )}
                </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};
