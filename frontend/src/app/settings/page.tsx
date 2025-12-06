'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Palette, Bell, Shield, HelpCircle, LogOut, Check } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { ACCENT_COLORS, AccentColorKey } from '@/types';
import { getAccentColor, setAccentColor } from '@/lib/theme';
import { getAuthToken, setAuthToken } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [currentAccent, setCurrentAccent] = useState<AccentColorKey>('orange');
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    setCurrentAccent(getAccentColor());
  }, [router]);
  
  const handleAccentChange = (color: AccentColorKey) => {
    setCurrentAccent(color);
    setAccentColor(color);
  };
  
  const handleLogout = () => {
    setAuthToken(null);
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={20} className="text-white/60" />
          </button>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Appearance */}
        <div>
          <h2 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3 px-1">
            Appearance
          </h2>
          
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Palette size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Accent Color</p>
                <p className="text-white/40 text-xs">Customize your app theme</p>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {(Object.entries(ACCENT_COLORS) as [AccentColorKey, typeof ACCENT_COLORS[AccentColorKey]][]).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => handleAccentChange(key)}
                  className="relative aspect-square rounded-xl transition-transform hover:scale-105"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {currentAccent === key && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-white/30 mt-3 text-center">
              {ACCENT_COLORS[currentAccent].name}
            </p>
          </Card>
        </div>
        
        {/* Notifications */}
        <div>
          <h2 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3 px-1">
            Notifications
          </h2>
          
          <Card variant="elevated" padding="none">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">Push Notifications</p>
                <p className="text-white/40 text-xs">Manage notification preferences</p>
              </div>
              <ChevronLeft size={16} className="text-white/20 rotate-180" />
            </button>
          </Card>
        </div>
        
        {/* Privacy & Security */}
        <div>
          <h2 className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3 px-1">
            Privacy & Security
          </h2>
          
          <Card variant="elevated" padding="none">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">Privacy Settings</p>
                <p className="text-white/40 text-xs">Control who can see your trips</p>
              </div>
              <ChevronLeft size={16} className="text-white/20 rotate-180" />
            </button>
            
            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <HelpCircle size={18} className="text-violet-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">Help & Support</p>
                <p className="text-white/40 text-xs">Get help with the app</p>
              </div>
              <ChevronLeft size={16} className="text-white/20 rotate-180" />
            </button>
          </Card>
        </div>
        
        {/* Logout */}
        <Card variant="subtle" padding="none">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-500/5 transition-colors text-red-400"
          >
            <div className="p-2 rounded-lg bg-red-500/10">
              <LogOut size={18} />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </Card>
        
        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-white/20 text-xs">TravelConnect v1.0.0</p>
          <p className="text-white/10 text-[10px] mt-1">Made with ❤️ for travelers</p>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}






