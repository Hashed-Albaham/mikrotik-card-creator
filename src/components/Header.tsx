import { Wifi, Settings, Github } from 'lucide-react';

const Header = () => {
  return (
    <header className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center pulse-glow">
                <Wifi className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HashTik Mikrotik
              </h1>
              <p className="text-sm text-muted-foreground">مولد كروت وسكريبتات احترافي</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#generator" className="text-muted-foreground hover:text-primary transition-colors">
              المولد
            </a>
            <a href="#settings" className="text-muted-foreground hover:text-primary transition-colors">
              الإعدادات
            </a>
            <a href="#preview" className="text-muted-foreground hover:text-primary transition-colors">
              المعاينة
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              <Github className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
