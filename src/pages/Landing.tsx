import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Brain, 
  Shield, 
  Zap, 
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  PiggyBank,
  LogIn,
  User,
  LogOut,
  Settings,
  Palette
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';


const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Get user's display name (first name from email or full email)
  const getUserDisplayName = () => {
    if (!user?.email) return 'User';
    const email = user.email;
    const name = email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._]/g, ' ');
  };

  // Auto-redirect to dashboard if user is already signed in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Insights",
      description: "Get personalized financial recommendations based on your spending patterns and goals."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Smart Analytics",
      description: "Visualize your finances with interactive charts and detailed spending breakdowns."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Goal Tracking",
      description: "Set and track financial goals with progress monitoring and milestone celebrations."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Bank-level security with end-to-end encryption to protect your financial data."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Sync",
      description: "Your data syncs instantly across all devices, keeping you updated anywhere."
    },
    {
      icon: <PiggyBank className="h-8 w-8" />,
      title: "Savings Optimization",
      description: "Discover opportunities to save more and optimize your budget automatically."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
              content: "MoneyMate helped me save $3,000 in just 3 months! The AI recommendations are spot-on.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Software Engineer",
      content: "Finally, a budgeting app that actually understands my spending habits. Game changer!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      content: "The goal tracking feature motivated me to pay off my credit card debt faster than expected.",
      rating: 5
    }
  ];

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <DollarSign className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-success to-primary rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
              MoneyMate
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && user ? (
              // User is signed in - show user profile dropdown
              <div className="flex items-center gap-3">
                <Button 
                  asChild
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <Link to="/dashboard">
                    <LogIn className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-success text-white font-semibold">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // User is not signed in - show sign in button
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
            🚀 Now with AI-powered insights
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Take Control of Your
            <span className="block bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            MoneyMate combines intelligent budgeting with AI-powered insights to help you save more, 
            spend smarter, and achieve your financial goals faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            {!loading && user ? (
              // User is signed in - show dashboard button
              <Button 
                size="lg" 
                asChild
                className="text-lg px-10 py-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            ) : (
              // User is not signed in - show sign in button
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)} 
                className="text-lg px-10 py-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-lg px-10 py-8 border-2 hover:bg-primary/5 transition-all duration-300"
            >
              <Link to="/dashboard">
                Try Demo
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">10K+</div>
            <div className="text-muted-foreground font-medium">Active Users</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
            <div className="text-4xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent mb-2">$2.5M</div>
            <div className="text-muted-foreground font-medium">Total Savings</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-success/10 border border-primary/20">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">4.9★</div>
            <div className="text-muted-foreground font-medium">User Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose MoneyMate?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've built the most intelligent personal finance platform to help you achieve financial freedom.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-lg">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users who've transformed their financial lives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already saving more and achieving their financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!loading && user ? (
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={() => setShowAuthModal(true)} className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/dashboard">
                  Explore Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">MoneyMate</span>
              </div>
              <p className="text-muted-foreground">
                Your intelligent financial companion for smarter budgeting and goal achievement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Sign In</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>AI Recommendations</li>
                <li>Budget Tracking</li>
                <li>Goal Setting</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MoneyMate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
        onSuccess={() => {
          setShowAuthModal(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default Landing;
