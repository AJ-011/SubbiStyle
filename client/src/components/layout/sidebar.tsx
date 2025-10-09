import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import logoImg from "@assets/WhatsApp Image 2025-10-09 at 14.39.20_8843d208_1760046561681.jpg";

const navigation = [
  { name: "Home", href: "/", icon: "fas fa-home" },
  { name: "Shop", href: "/shop", icon: "fas fa-store" },
  { name: "My Passport", href: "/my-passport", icon: "fas fa-passport" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col shadow-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src={logoImg} 
            alt="Subbi logo" 
            className="w-16 h-16 object-contain"
            style={{ mixBlendMode: 'multiply' }}
            data-testid="app-logo-image"
          />
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary" data-testid="app-logo">
              Subbi
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
              FASHION WITH A CONSCIENCE
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2" data-testid="sidebar-navigation">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                isActive 
                  ? "sidebar-active" 
                  : "hover:bg-muted/20"
              )}
              data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-5`}></i>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          data-testid="button-sign-in"
        >
          <i className="fas fa-sign-in-alt"></i>
          Sign In
        </button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Join the cultural movement
        </p>
      </div>
    </aside>
  );
}
