'use client';

import { clsx } from 'clsx';
import { 
  Home, 
  Compass, 
  PlusCircle,
  Users, 
  User 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  href: string;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  { 
    icon: <Home size={22} strokeWidth={1.5} />, 
    activeIcon: <Home size={22} strokeWidth={2} />,
    label: 'Home', 
    href: '/dashboard' 
  },
  { 
    icon: <Compass size={22} strokeWidth={1.5} />, 
    activeIcon: <Compass size={22} strokeWidth={2} />,
    label: 'Explore', 
    href: '/explore' 
  },
  { 
    icon: <PlusCircle size={28} strokeWidth={1.5} />, 
    activeIcon: <PlusCircle size={28} strokeWidth={2} />,
    label: 'Post', 
    href: '/travels/new',
    isAction: true 
  },
  { 
    icon: <Users size={22} strokeWidth={1.5} />, 
    activeIcon: <Users size={22} strokeWidth={2} />,
    label: 'Network', 
    href: '/network' 
  },
  { 
    icon: <User size={22} strokeWidth={1.5} />, 
    activeIcon: <User size={22} strokeWidth={2} />,
    label: 'Profile', 
    href: '/profile' 
  },
];

export function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent" />
      
      <div className="relative max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-20 pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-6"
                >
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">
                    {item.icon}
                  </div>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 px-4 transition-all duration-200',
                  isActive ? 'text-orange-400' : 'text-white/40 hover:text-white/70'
                )}
              >
                <div className="relative">
                  {isActive ? item.activeIcon : item.icon}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
