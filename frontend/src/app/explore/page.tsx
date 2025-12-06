'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Users, Sparkles, ChevronRight, Map, X, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { TravelCard } from '@/components/features/TravelCard';
import { usersApi, feedApi, travelRequestsApi, getAuthToken } from '@/lib/api';
import { User, TravelPlan } from '@/types';
import { clsx } from 'clsx';
import { debounce } from '@/lib/utils';

// Popular destinations with realistic data
const popularDestinations = [
  { city: 'Goa', code: 'GOI', emoji: '🏖️', travelers: 12, color: 'from-cyan-500/20 to-blue-500/10' },
  { city: 'Delhi', code: 'DEL', emoji: '🏛️', travelers: 28, color: 'from-orange-500/20 to-amber-500/10' },
  { city: 'Mumbai', code: 'BOM', emoji: '🌆', travelers: 35, color: 'from-purple-500/20 to-pink-500/10' },
  { city: 'Bangalore', code: 'BLR', emoji: '💻', travelers: 42, color: 'from-green-500/20 to-emerald-500/10' },
  { city: 'Jaipur', code: 'JAI', emoji: '🏰', travelers: 8, color: 'from-rose-500/20 to-pink-500/10' },
  { city: 'Hyderabad', code: 'HYD', emoji: '🍗', travelers: 15, color: 'from-yellow-500/20 to-orange-500/10' },
];

// Community categories
const communities = [
  { key: 'creators', label: 'Creators Hub', emoji: '🎬', members: 234, desc: 'Content creators & influencers' },
  { key: 'founders', label: 'Startup Founders', emoji: '🚀', members: 156, desc: 'Entrepreneurs & investors' },
  { key: 'solo', label: 'Solo Travelers', emoji: '🎒', members: 412, desc: 'Adventure seekers' },
  { key: 'remote', label: 'Digital Nomads', emoji: '💻', members: 189, desc: 'Work from anywhere' },
];

export default function ExplorePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [travels, setTravels] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'destinations' | 'travelers' | 'communities'>('destinations');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  
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
      const userData = await usersApi.getMe();
      setUser(userData as User);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setTravels([]);
        setSearching(false);
        return;
      }
      
      setSearching(true);
      try {
        const data = await feedApi.search(query, 20);
        setTravels(data as TravelPlan[]);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setActiveSection('travelers');
    }
    performSearch(query);
  };
  
  const handleCityClick = async (city: string) => {
    setSelectedCity(city);
    setSearchQuery(city);
    setActiveSection('travelers');
    setSearching(true);
    
    try {
      const data = await feedApi.inCity(city);
      setTravels(data as TravelPlan[]);
    } catch (error) {
      console.error('Failed to load travelers:', error);
    } finally {
      setSearching(false);
    }
  };
  
  const handleTagAlong = async (travelId: string) => {
    try {
      await travelRequestsApi.request(travelId);
      // Refresh the list
      if (selectedCity) {
        const data = await feedApi.inCity(selectedCity);
        setTravels(data as TravelPlan[]);
      } else if (searchQuery) {
        const data = await feedApi.search(searchQuery, 20);
        setTravels(data as TravelPlan[]);
      }
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setTravels([]);
    setActiveSection('destinations');
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
      
      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Explore
          </h1>
          <p className="text-white/40 text-sm">
            Discover destinations & travelers
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search destinations, travelers..."
            value={searchQuery}
            onChange={handleSearchChange}
            icon={searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            className="pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>
        
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {[
            { key: 'destinations', label: 'Destinations', icon: Map },
            { key: 'travelers', label: 'Travelers', icon: Users },
            { key: 'communities', label: 'Communities', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all',
                  activeSection === tab.key
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Destinations Section */}
        {activeSection === 'destinations' && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-white/60">Popular Destinations</h2>
            <div className="grid grid-cols-2 gap-3">
              {popularDestinations.map((dest) => (
                <Card
                  key={dest.city}
                  variant="elevated"
                  padding="md"
                  hover
                  onClick={() => handleCityClick(dest.city)}
                  className={`relative overflow-hidden`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} opacity-50`} />
                  
                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">{dest.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{dest.city}</p>
                      <p className="text-white/30 text-[10px]">{dest.travelers} travelers</p>
                    </div>
                    <ChevronRight size={14} className="text-white/20 flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Map placeholder */}
            <Card variant="subtle" padding="lg" className="text-center mt-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Map size={28} className="text-white/20" />
              </div>
              <p className="text-white/40 text-sm">Interactive map</p>
              <p className="text-white/20 text-xs">Coming soon</p>
            </Card>
          </div>
        )}
        
        {/* Travelers Section */}
        {activeSection === 'travelers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/60">
                {selectedCity ? `Travelers to ${selectedCity}` : searchQuery ? `Results for "${searchQuery}"` : 'Active Travelers'}
              </h2>
              <span className="text-xs text-white/30">{travels.length} found</span>
            </div>
            
            {searching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-accent animate-spin" />
              </div>
            ) : travels.length > 0 ? (
              travels.map((travel) => (
                <TravelCard
                  key={travel.id}
                  travel={travel}
                  compact
                  onClick={() => router.push(`/travels/${travel.id}`)}
                  onTagAlong={() => handleTagAlong(travel.id)}
                />
              ))
            ) : (
              <Card variant="subtle" padding="lg" className="text-center">
                <MapPin size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-1">
                  {searchQuery ? 'No travelers found' : 'Search for a destination'}
                </p>
                <p className="text-white/20 text-xs">
                  {searchQuery ? 'Try a different search' : 'Or tap on a popular destination above'}
                </p>
              </Card>
            )}
          </div>
        )}
        
        {/* Communities Section */}
        {activeSection === 'communities' && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-white/60">Join a Community</h2>
            
            {communities.map((community) => (
              <Card
                key={community.key}
                variant="elevated"
                padding="md"
                hover
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-amber-500/10 flex items-center justify-center text-2xl">
                  {community.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{community.label}</p>
                  <p className="text-white/30 text-xs">{community.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm font-medium">{community.members}</p>
                  <p className="text-white/20 text-[10px]">members</p>
                </div>
              </Card>
            ))}
            
            {/* Upcoming Events */}
            <div className="pt-4">
              <h2 className="text-sm font-medium text-white/60 mb-3">Upcoming Meetups</h2>
              <Card variant="gradient" padding="md" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
                <div className="relative flex items-center gap-4">
                  <div className="text-center min-w-[48px]">
                    <p className="text-2xl font-bold text-accent">15</p>
                    <p className="text-[10px] text-white/40">DEC</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">Creator Meetup</p>
                    <p className="text-white/40 text-xs">Delhi • 23 going</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
                    RSVP
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
