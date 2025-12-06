'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TravelCard } from '@/components/features/TravelCard';
import { usersApi, travelsApi, getAuthToken } from '@/lib/api';
import { User, TravelPlan } from '@/types';

export default function TravelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myTravels, setMyTravels] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
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
      const [userData, travelsData] = await Promise.all([
        usersApi.getMe(),
        travelsApi.getMy(),
      ]);
      setUser(userData as User);
      setMyTravels(travelsData as TravelPlan[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const upcomingTravels = myTravels.filter(
    t => new Date(t.travel_date) >= new Date() && t.status !== 'cancelled'
  );
  
  const pastTravels = myTravels.filter(
    t => new Date(t.travel_date) < new Date() || t.status === 'completed'
  );
  
  const displayedTravels = activeTab === 'upcoming' ? upcomingTravels : pastTravels;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#E8654B] border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-24">
      <Header user={user} />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Travels</h1>
            <p className="text-neutral-500 text-sm">
              {myTravels.length} total trips
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/travels/new')}
          >
            <Plus size={18} className="mr-1" />
            New Trip
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            Upcoming
            {upcomingTravels.length > 0 && (
              <Badge variant="primary" size="sm" className="ml-2">
                {upcomingTravels.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            Past
          </button>
        </div>
        
        {/* Travels List */}
        <div className="space-y-4">
          {displayedTravels.length > 0 ? (
            displayedTravels.map((travel) => (
              <TravelCard
                key={travel.id}
                travel={{
                  ...travel,
                  user_name: user?.name,
                  user_avatar: user?.avatar_url,
                  user_profession: user?.profession,
                }}
                onClick={() => router.push(`/travels/${travel.id}`)}
              />
            ))
          ) : (
            <Card variant="default" padding="lg" className="text-center">
              <p className="text-neutral-500 mb-4">
                {activeTab === 'upcoming'
                  ? "No upcoming trips. Plan your next adventure!"
                  : "No past trips yet."}
              </p>
              {activeTab === 'upcoming' && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/travels/new')}
                >
                  Create Trip
                </Button>
              )}
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

