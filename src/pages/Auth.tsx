import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  const switchToSignUp = () => {
    setMode('signup');
  };

  const switchToSignIn = () => {
    setMode('signin');
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home */}
        <div className="flex items-center">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Auth Form */}
        {mode === 'signin' ? (
          <SignInForm onSwitchToSignUp={switchToSignUp} onSuccess={handleAuthSuccess} />
        ) : (
          <SignUpForm onSwitchToSignIn={switchToSignIn} onSuccess={handleAuthSuccess} />
        )}

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Welcome to MoneyMate</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Your personal finance companion. Track expenses, set budgets, and get AI-powered recommendations to achieve your financial goals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
