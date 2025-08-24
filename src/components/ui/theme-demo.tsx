import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeDemo() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Theme Demo</span>
            <ThemeToggle />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Current Theme: {theme}</Badge>
            <Badge variant="outline">Resolved: {resolvedTheme}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">Primary Card</div>
                <p className="text-muted-foreground">This card uses primary colors</p>
              </CardContent>
            </Card>
            
            <Card className="bg-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">Success Card</div>
                <p className="text-muted-foreground">This card uses success colors</p>
              </CardContent>
            </Card>
            
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-warning">Warning Card</div>
                <p className="text-muted-foreground">This card uses warning colors</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Bar</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
