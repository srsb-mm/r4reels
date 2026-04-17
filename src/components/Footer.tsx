import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-background mt-8 mb-20 md:mb-0">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} R4 Reels. All rights reserved.</div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
