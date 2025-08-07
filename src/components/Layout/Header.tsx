import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Car, Menu, Phone, Calendar, User, Star, Wrench, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { href: '/', label: 'Accueil', icon: Car },
    { href: '/rdv', label: 'Réserver RDV', icon: Calendar },
    { href: '/espace-client', label: 'Mon Espace', icon: User },
    { href: '/satisfaction', label: 'Satisfaction', icon: Star },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group interactive-hover">
            <div className="p-3 bg-primary rounded-xl glow-primary group-hover:glow-primary-strong transition-all duration-300 group-hover:scale-105">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">AutoExpert</h1>
              <p className="text-xs text-muted-foreground">Agence Automobile</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">{item.label}</span>
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                    isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></div>
                </Link>
              );
            })}
          </nav>

          {/* Contact Button and Auth */}
          <div className="hidden lg:flex items-center space-x-5">
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm bg-white/5"
            >
              <a href="tel:0123456789" className="flex items-center space-x-2.5 px-5 py-2.5">
                <Phone className="h-4 w-4" />
                <span className="font-medium">01 23 45 67 89</span>
              </a>
            </Button>
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20 backdrop-blur-sm bg-white/5 px-5 py-2.5"
              >
                <LogOut className="h-4 w-4 mr-2.5" />
                <span className="font-medium">Déconnexion</span>
              </Button>
            ) : (
              <Button asChild size="lg" className="btn-primary px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/auth" className="flex items-center space-x-2.5">
                  <User className="h-4 w-4" />
                  <span>Connexion</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="lg" className="lg:hidden hover:bg-white/10 transition-all duration-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass-effect border-l border-white/10">
              <div className="flex flex-col space-y-8 mt-8">
                <div className="flex items-center space-x-3 pb-6 border-b border-border/30">
                  <div className="p-3 bg-primary rounded-xl glow-primary">
                    <Car className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AutoExpert</h2>
                    <p className="text-sm text-muted-foreground">Agence Automobile</p>
                  </div>
                </div>
                
                <nav className="flex flex-col space-y-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 font-medium ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-foreground hover:bg-white/5 hover:text-primary'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="space-y-4 pt-4">
                  <Button asChild className="w-full btn-primary py-3 font-medium">
                    <a href="tel:0123456789" className="flex items-center justify-center space-x-3">
                      <Phone className="h-4 w-4" />
                      <span>01 23 45 67 89</span>
                    </a>
                  </Button>

                  {user ? (
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground py-3 font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Déconnexion
                    </Button>
                  ) : (
                    <Button asChild className="w-full btn-primary py-3 font-medium">
                      <Link to="/auth" className="flex items-center justify-center space-x-3">
                        <User className="h-4 w-4" />
                        <span>Connexion</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;