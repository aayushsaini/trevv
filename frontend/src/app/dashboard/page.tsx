'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TravelCard } from '@/components/features/TravelCard';
import { IntentFilter } from '@/components/features/IntentFilter';
import { usersApi, feedApi, travelRequestsApi, followsApi, getAuthToken } from '@/lib/api';
import { User, TravelPlan } from '@/types';
import { clsx } from 'clsx';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [feed, setFeed] = useState<TravelPlan[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [showFull, setShowFull] = useState(true);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [router, selectedIntent, activeTab, showFull]);
  
  const loadData = async () => {
    try {
      const [userData, feedData] = await Promise.all([
        usersApi.getMe(),
        feedApi.get({ 
          limit: 20, 
          intent: selectedIntent || undefined,
          following_only: activeTab === 'following',
          show_full: showFull,
        }),
      ]);
      
      setUser(userData as User);
      setFeed(feedData as TravelPlan[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTagAlong = async (travelId: string) => {
    try {
      await travelRequestsApi.request(travelId, "Hey! I'd love to join your journey!");
      loadData();
    } catch (error: any) {
      console.error('Failed to send request:', error);
    }
  };
  
  const handleFollow = async (userId: string) => {
    try {
      await followsApi.follow(userId);
      loadData();
    } catch (error: any) {
      console.error('Failed to follow:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      <Header user={user} />
      
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Primary CTA - Share Your Journey (matching screenshot) */}
        <Card 
          variant="gradient" 
          padding="lg" 
          glow 
          className="relative overflow-hidden cursor-pointer"
          onClick={() => router.push('/travels/new')}
        >
          {/* Background gradient orb */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/30 via-orange-600/10 to-transparent rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-accent" />
              <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                Share your journey
              </span>
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-6">
              Where are you heading?
            </h2>
            
            <Button
              variant="primary"
              size="md"
              className="group"
            >
              Create Trip
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </Card>
        
        {/* Location hint */}
        {user?.current_city && (
          <div className="flex items-center gap-2 text-white/40 text-sm px-1">
            <MapPin size={14} className="text-accent" />
            <span>Showing travelers near <span className="text-white/60">{user.current_city}</span></span>
          </div>
        )}
        
        {/* Feed Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setActiveTab('foryou')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition-all',
              activeTab === 'foryou'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <TrendingUp size={14} />
            For You
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition-all',
              activeTab === 'following'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <Users size={14} />
            Following
          </button>
        </div>
        
        {/* Intent Filters */}
        <IntentFilter
          selected={selectedIntent}
          onChange={setSelectedIntent}
        />
        
        {/* Show full toggle */}
        <button
          onClick={() => setShowFull(!showFull)}
          className={clsx(
            'text-xs px-3 py-1.5 rounded-full transition-all',
            showFull
              ? 'bg-white/5 text-white/40 hover:text-white/60'
              : 'bg-green-500/10 text-green-400'
          )}
        >
          {showFull ? 'Show all' : '✓ Available only'}
        </button>
        
        {/* Travel Feed */}
        <div className="space-y-3">
          {feed.length > 0 ? (
            feed.map((travel, index) => (
              <div key={travel.id} style={{ animationDelay: `${index * 50}ms` }}>
                <TravelCard
                  travel={travel}
                  onClick={() => router.push(`/travels/${travel.id}`)}
                  onTagAlong={() => handleTagAlong(travel.id)}
                  onFollow={() => handleFollow(travel.user_id)}
                />
              </div>
            ))
          ) : (
            <Card variant="subtle" padding="lg" className="text-center">
              <p className="text-3xl mb-3">✨</p>
              <p className="text-white/60 text-sm mb-1">
                {activeTab === 'following' 
                  ? "No trips from people you follow"
                  : "No travelers found nearby"}
              </p>
              <p className="text-white/30 text-xs mb-4">
                Be the first to share your journey!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/travels/new')}
              >
                Share Your Trip
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
