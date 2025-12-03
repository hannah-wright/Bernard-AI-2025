import { Button } from '@/components/ui/button';
import { Search, Bell, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-sm font-bold text-background">VS</span>
              </div>
              <span className="font-semibold text-lg">VentureScout</span>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-foreground">
                Dashboard
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Alerts
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Saved
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-success" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden sm:flex">
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
