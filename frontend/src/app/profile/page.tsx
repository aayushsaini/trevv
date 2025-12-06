'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Edit2, Users, Plane, Plus } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { TravelCard } from '@/components/features/TravelCard';
import { usersApi, followsApi, travelsApi, getAuthToken, setAuthToken } from '@/lib/api';
import { User, FollowStats, TravelPlan } from '@/types';
import { clsx } from 'clsx';

const profileTypeLabels: Record<string, { emoji: string; label: string }> = {
  creator: { emoji: '🎬', label: 'Creator' },
  founder: { emoji: '🚀', label: 'Founder' },
  traveler: { emoji: '🎒', label: 'Traveler' },
  professional: { emoji: '💼', label: 'Professional' },
  explorer: { emoji: '🌍', label: 'Explorer' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [myTravels, setMyTravels] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trips' | 'connections'>('trips');
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [router]);
  
  const loadData = async () => {
    try {
      const userData = await usersApi.getMe() as User;
      setUser(userData);
      
      // Get follow stats and travels
      const [stats, travels] = await Promise.all([
        followsApi.stats(userData.id),
        travelsApi.getMy(),
      ]);
      
      setFollowStats(stats as FollowStats);
      setMyTravels(travels as TravelPlan[]);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    setAuthToken(null);
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const profileType = user?.profile_type ? profileTypeLabels[user.profile_type] : null;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Custom Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Profile</h1>
          <button 
            onClick={() => router.push('/settings')}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Settings size={20} className="text-white/40" />
          </button>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto px-4 py-2 space-y-4">
        {/* Profile Header */}
        <div className="text-center py-4">
          <Avatar
            src={user?.avatar_url}
            name={user?.name || 'User'}
            size="xl"
            hasStory={myTravels.length > 0}
            className="mx-auto mb-3"
          />
          
          <h1 className="text-xl font-bold text-white mb-1">
            {user?.name}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            {profileType && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs">
                {profileType.emoji} {profileType.label}
              </span>
            )}
          </div>
          
          {user?.profession && (
            <p className="text-white/40 text-sm">
              {user.profession}
              {user.company && ` at ${user.company}`}
            </p>
          )}
          
          {user?.bio && (
            <p className="text-white/30 text-xs mt-2 max-w-xs mx-auto">
              {user.bio}
            </p>
          )}
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card variant="subtle" padding="sm" className="text-center">
            <p className="text-xl font-bold text-white">{myTravels.length}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Trips</p>
          </Card>
          <Card variant="subtle" padding="sm" className="text-center">
            <p className="text-xl font-bold text-white">{followStats?.followers_count || 0}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Followers</p>
          </Card>
          <Card variant="subtle" padding="sm" className="text-center">
            <p className="text-xl font-bold text-white">{followStats?.following_count || 0}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Following</p>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => router.push('/profile/edit')}
          >
            <Edit2 size={14} className="mr-1.5" />
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => router.push('/travels/new')}
          >
            <Plus size={14} className="mr-1.5" />
            New Trip
          </Button>
        </div>
        
        {/* Content Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setActiveTab('trips')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition-all',
              activeTab === 'trips'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <Plane size={14} />
            My Trips
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-sm transition-all',
              activeTab === 'connections'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <Users size={14} />
            Connections
          </button>
        </div>
        
        {/* My Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            {myTravels.length > 0 ? (
              myTravels.map((travel) => (
                <TravelCard
                  key={travel.id}
                  travel={{...travel, user_name: user?.name, user_avatar: user?.avatar_url, user_profession: user?.profession}}
                  compact
                  showActions={false}
                  onClick={() => router.push(`/travels/${travel.id}`)}
                />
              ))
            ) : (
              <Card variant="subtle" padding="lg" className="text-center">
                <Plane size={32} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No trips yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/travels/new')}
                >
                  Create Your First Trip
                </Button>
              </Card>
            )}
          </div>
        )}
        
        {/* Connections */}
        {activeTab === 'connections' && (
          <Card variant="subtle" padding="lg" className="text-center">
            <Users size={32} className="text-white/10 mx-auto mb-2" />
            <p className="text-white/40 text-sm">View connections in Network tab</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => router.push('/network')}
            >
              Go to Network
            </Button>
          </Card>
        )}
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-400/60 text-sm hover:text-red-400 transition-colors"
        >
          Sign Out
        </button>
      </main>
      
      <BottomNav />
    </div>
  );
}
