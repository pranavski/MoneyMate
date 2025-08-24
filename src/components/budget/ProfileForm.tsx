import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormProps {
  onProfileComplete: () => void;
}

export const ProfileForm = ({ onProfileComplete }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    age: '',
    salary: '',
    maritalStatus: '',
    financialGoals: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const goalOptions = [
    'Emergency Fund',
    'Retirement Savings',
    'Home Purchase',
    'Debt Reduction',
    'Travel',
    'Education',
    'Investment Growth',
    'Starting a Business'
  ];

  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      financialGoals: checked 
        ? [...prev.financialGoals, goal]
        : prev.financialGoals.filter(g => g !== goal)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          age: parseInt(formData.age),
          salary: parseFloat(formData.salary),
          marital_status: formData.maritalStatus,
          financial_goals: formData.financialGoals
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your financial profile has been updated successfully."
      });
      
      onProfileComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Financial Profile Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                required
                min="18"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="salary">Annual Salary ($)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                required
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div>
            <Label>Marital Status</Label>
            <RadioGroup
              value={formData.maritalStatus}
              onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="married" />
                <Label htmlFor="married">Married</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="divorced" id="divorced" />
                <Label htmlFor="divorced">Divorced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="widowed" id="widowed" />
                <Label htmlFor="widowed">Widowed</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Financial Goals (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {goalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.financialGoals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !formData.age || !formData.salary || !formData.maritalStatus}
          >
            {isSubmitting ? 'Saving...' : 'Save Profile & Get AI Recommendations'}
          </Button>
        </form>
      </CardContent>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
        onSuccess={() => setShowAuthModal(false)}
      />
    </Card>
  );
};