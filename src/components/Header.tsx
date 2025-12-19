import { Wifi, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center pulse-glow">
                <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success border-2 border-background" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HashTik Mikrotik
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">مولد كروت وسكريبتات احترافي</p>
            </div>
          </div>

          {/* Desktop Navigation */}
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
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
            <a 
              href="#generator" 
              className="text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              المولد
            </a>
            <a 
              href="#settings" 
              className="text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              الإعدادات
            </a>
            <a 
              href="#preview" 
              className="text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              المعاينة
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
