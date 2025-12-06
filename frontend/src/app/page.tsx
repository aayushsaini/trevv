'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthToken } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);
  
  if (!mounted) return null;
  
  const features = [
    {
      icon: '✈️',
      title: 'Share Your Journey',
      description: 'Post your travel plans and connect with co-travelers',
    },
    {
      icon: '🚕',
      title: 'Smart Cab Sharing',
      description: 'Split costs to airports with verified travelers',
    },
    {
      icon: '🤝',
      title: 'Meaningful Connections',
      description: 'Network with professionals who share your route',
    },
    {
      icon: '🎯',
      title: 'Travel Intents',
      description: 'Match based on what you\'re looking for - coffee, collab, or adventure',
    },
  ];
  
  const useCases = [
    { emoji: '🎬', label: 'Creators seeking collabs' },
    { emoji: '🚀', label: 'Founders meeting investors' },
    { emoji: '🎒', label: 'Solo travelers finding buddies' },
    { emoji: '💼', label: 'Professionals networking' },
  ];
  
  return (
    <main className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-6 py-12">
        {/* Logo & Tagline */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
            <Sparkles size={16} />
            Travel Smarter, Together
          </div>
          
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            <span className="text-gradient">TravelConnect</span>
          </h1>
          
          <p className="text-white/60 text-lg leading-relaxed">
            The micro social network for travelers.<br />
            Share rides. Make connections. Travel better.
          </p>
        </div>
        
        {/* Hero Visual */}
        <div className="relative mb-10 animate-fade-in-up stagger-1">
          <Card variant="gradient" padding="lg" glow>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/40 text-sm mb-1">Your next trip</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">BLR</span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-px bg-gradient-to-r from-orange-500 to-transparent" />
                    <Plane size={16} className="text-orange-400 rotate-90" />
                    <div className="w-8 h-px bg-gradient-to-l from-orange-500 to-transparent" />
                  </div>
                  <span className="text-3xl font-bold text-white">DEL</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-sm mb-1">Matched travelers</p>
                <div className="flex -space-x-2">
                  {['👨‍💻', '👩‍🎨', '👨‍🚀'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-lg ring-2 ring-[#0a0a0f]">
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs">
                🚕 Cab sharing
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                ☕ Open for coffee
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                🚀 Startup networking
              </span>
            </div>
          </Card>
        </div>
        
        {/* Use Cases */}
        <div className="mb-10 animate-fade-in-up stagger-2">
          <p className="text-center text-white/40 text-sm mb-4">Perfect for</p>
          <div className="flex flex-wrap justify-center gap-2">
            {useCases.map((item) => (
              <span key={item.label} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
                {item.emoji} {item.label}
              </span>
            ))}
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="default"
              padding="md"
              className={`animate-fade-in-up stagger-${index + 2}`}
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <h3 className="font-semibold text-white text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-3 animate-fade-in-up stagger-5">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push('/register')}
            className="group"
          >
            Start Connecting
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => router.push('/login')}
          >
            I have an account
          </Button>
        </div>
        
        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-8">
          Join 10,000+ travelers already connecting
        </p>
      </div>
    </main>
  );
}
