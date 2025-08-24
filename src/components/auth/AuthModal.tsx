import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'signin', onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const navigate = useNavigate();

  const handleSuccess = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/dashboard');
    }
  };

  const switchToSignUp = () => {
    setMode('signup');
  };

  const switchToSignIn = () => {
    setMode('signin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>
        
        {mode === 'signin' ? (
          <SignInForm 
            onSuccess={handleSuccess}
            onSwitchToSignUp={switchToSignUp}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
