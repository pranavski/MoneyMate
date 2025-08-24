import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ProfileData {
  name: string;
  age: string;
  occupation: string;
  income: string;
  expenses: string;
  debt: string;
  financialGoals: string;
  riskTolerance: string;
  investmentExperience: string;
}

interface ProfileChatProps {
  onComplete: (data: ProfileData) => void;
}

const questions = [
  {
    id: 'name',
    question: "Hi! I'm your financial assistant. What's your name?",
    type: 'text',
    placeholder: 'Enter your name'
  },
  {
    id: 'age',
    question: "Nice to meet you! How old are you?",
    type: 'text',
    placeholder: 'Enter your age'
  },
  {
    id: 'occupation',
    question: "What do you do for work?",
    type: 'text',
    placeholder: 'Enter your occupation'
  },
  {
    id: 'income',
    question: "What's your approximate monthly income?",
    type: 'text',
    placeholder: 'Enter your monthly income'
  },
  {
    id: 'expenses',
    question: "How much do you typically spend each month?",
    type: 'text',
    placeholder: 'Enter your monthly expenses'
  },
  {
    id: 'debt',
    question: "Do you have any outstanding debt? If yes, how much?",
    type: 'text',
    placeholder: 'Enter your total debt amount'
  },
  {
    id: 'financialGoals',
    question: "What are your main financial goals? (e.g., save for retirement, buy a house, pay off debt)",
    type: 'textarea',
    placeholder: 'Describe your financial goals'
  },
  {
    id: 'riskTolerance',
    question: "How would you describe your risk tolerance when it comes to investments?",
    type: 'select',
    options: ['Conservative', 'Moderate', 'Aggressive']
  },
  {
    id: 'investmentExperience',
    question: "What's your experience level with investing?",
    type: 'select',
    options: ['Beginner', 'Intermediate', 'Advanced']
  }
];

export const ProfileChat = ({ onComplete }: ProfileChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
              content: "Welcome to MoneyMate! I'm here to help you set up your financial profile. Let's start with some basic information to personalize your experience.",
      timestamp: new Date()
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!currentInput.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const userResponse = currentInput.trim();
    
    // Add user message
    addMessage(userResponse, 'user');
    
    // Update profile data
    setProfileData(prev => ({
      ...prev,
      [currentQuestion.id]: userResponse
    }));

    // Clear input
    setCurrentInput('');

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      setTimeout(() => {
        addMessage(nextQuestion.question, 'bot');
      }, 500);
    } else {
      // Complete profile setup
      setTimeout(() => {
        addMessage("Perfect! I have all the information I need. Let me set up your personalized financial profile.", 'bot');
        setIsComplete(true);
      }, 500);
    }
  };

  const handleComplete = () => {
    if (Object.keys(profileData).length === questions.length) {
      onComplete(profileData as ProfileData);
      toast({
        title: "Profile Complete!",
        description: "Your financial profile has been set up successfully."
      });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Financial Profile Setup
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let's get to know your financial situation better
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        {!isComplete && (
          <div className="border-t p-4">
            <div className="flex gap-2">
              {currentQuestion.type === 'select' ? (
                <Select onValueChange={setCurrentInput}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={currentQuestion.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : currentQuestion.type === 'textarea' ? (
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
              ) : (
                <Input
                  placeholder={currentQuestion.placeholder}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
              )}
              <Button onClick={handleSend} disabled={!currentInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Complete Button */}
        {isComplete && (
          <div className="border-t p-4">
            <Button onClick={handleComplete} className="w-full">
              Complete Profile Setup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

