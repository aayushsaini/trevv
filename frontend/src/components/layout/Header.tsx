'use client';

import { Bell, MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user?: {
    name: string;
    avatar_url?: string | null;
    current_city?: string;
  } | null;
  showLocation?: boolean;
}

export function Header({ user, showLocation = true }: HeaderProps) {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* User greeting */}
          <Link href="/profile" className="flex items-center gap-3">
            <Avatar
              src={user?.avatar_url}
              name={user?.name || 'User'}
              size="md"
              hasStory={true}
            />
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Welcome back</p>
              <p className="font-semibold text-white text-sm">
                {user?.name?.split(' ')[0] || 'Traveler'}
              </p>
            </div>
          </Link>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {showLocation && user?.current_city && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5">
                <MapPin size={12} className="text-orange-400" />
                <span className="text-[10px] text-white/50">{user.current_city}</span>
              </div>
            )}
            
            <button 
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
