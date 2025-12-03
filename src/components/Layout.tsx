import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, MessageCircle, User, Film } from 'lucide-react';
import logo from '@/assets/r4-logo.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Film, label: 'Reels', path: '/reels' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: Heart, label: 'Activity', path: '/activity' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="R4 Reels" className="h-8 w-8" />
            <span className="text-xl font-semibold">R4 Reels</span>
          </Link>
          {/* Mobile Message Button */}
          <Link
            to="/messages"
            className="md:hidden flex items-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-6 w-6" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.slice(0, -1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 transition-colors ${
                  location.pathname === item.path
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            ))}
            <Link
              to="/messages"
              className={`flex items-center gap-2 transition-colors ${
                location.pathname === '/messages'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="h-6 w-6" />
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-2 transition-colors ${
                location.pathname === '/profile'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-6 w-6" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-colors ${
                location.pathname === item.path
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-6 w-6" />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
