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
    <header className="fixed top-0 left-0 right-0 z-50 header-glass">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-3 bg-primary rounded-xl glow-primary group-hover:glow-primary-strong transition-all duration-500 group-hover:scale-105">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">AutoExpert</h1>
              <p className="text-sm text-muted-foreground">Agence Automobile</p>
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-500 link-animated group ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'text-foreground hover:text-primary hover:bg-primary/5 hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5 group-hover:rotate-6 transition-transform duration-300" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contact Button and Auth */}
          <div className="hidden md:flex items-center space-x-5">
            <Button asChild variant="outline" size="lg" className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:glow-accent transition-all duration-500 px-6 py-3">
              <a href="tel:0123456789" className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span className="font-medium">01 23 45 67 89</span>
              </a>
            </Button>
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-all duration-500 px-6 py-3"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">Déconnexion</span>
              </Button>
            ) : (
              <Button asChild variant="default" size="lg" className="btn-primary px-6 py-3 hover:scale-105">
                <Link to="/auth" className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Connexion</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="lg" className="lg:hidden p-3 hover:bg-primary/10 hover:scale-110 transition-all duration-300">
                <Menu className="h-6 w-6 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col space-y-6 mt-8">
                <div className="flex items-center space-x-2 pb-4 border-b border-border">
                  <div className="p-2 bg-primary rounded-lg">
                    <Car className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold">AutoExpert</h2>
                    <p className="text-sm text-muted-foreground">Agence Automobile</p>
                  </div>
                </div>
                
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Button asChild className="w-full btn-primary">
                  <a href="tel:0123456789" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>01 23 45 67 89</span>
                  </a>
                </Button>

                {user ? (
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                ) : (
                  <Button asChild variant="default" className="w-full">
                    <Link to="/auth" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Connexion</span>
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;