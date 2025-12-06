'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, Plane, Train, Bus, Car, MapPin, Clock, Calendar, 
  UserPlus, Heart, MessageCircle, Share2, Navigation
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { travelsApi, connectionsApi, followsApi, getAuthToken } from '@/lib/api';
import { TravelPlan, TRAVEL_INTENTS } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

const travelIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  other: MapPin,
};

const profileTypeLabels: Record<string, string> = {
  creator: '🎬 Creator',
  founder: '🚀 Founder',
  traveler: '🎒 Traveler',
  professional: '💼 Professional',
  explorer: '🌍 Explorer',
};

export default function TravelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const travelId = params.id as string;
  
  const [travel, setTravel] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [connectionSent, setConnectionSent] = useState(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadTravel();
  }, [router, travelId]);
  
  const loadTravel = async () => {
    try {
      const data = await travelsApi.getById(travelId);
      setTravel(data as TravelPlan);
    } catch (error) {
      console.error('Failed to load travel:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnect = async () => {
    if (!travel) return;
    try {
      await connectionsApi.request({
        addressee_id: travel.user_id,
        context: 'travel',
        message: `Hey! I saw your trip to ${travel.destination}. Would love to connect!`,
      });
      setConnectionSent(true);
    } catch (error: any) {
      console.error('Failed to connect:', error);
    }
  };
  
  const handleFollow = async () => {
    if (!travel) return;
    try {
      await followsApi.follow(travel.user_id);
      setIsFollowing(true);
    } catch (error: any) {
      console.error('Failed to follow:', error);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share && travel) {
      await navigator.share({
        title: `Trip to ${travel.destination}`,
        text: `Check out ${travel.user_name}'s trip from ${travel.origin} to ${travel.destination}`,
        url: window.location.href,
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!travel) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <p className="text-white/40 mb-4">Trip not found</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  const Icon = travelIcons[travel.travel_type] || MapPin;
  const travelDate = new Date(travel.travel_date);
  const isUpcoming = travelDate > new Date();
  const primaryIntent = travel.travel_intents?.find(i => i.is_primary) || travel.travel_intents?.[0];
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={20} className="text-white/60" />
          </button>
          
          <h1 className="text-base font-semibold text-white">Trip Details</h1>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Share2 size={18} className="text-white/40" />
          </button>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Route Hero */}
        <Card variant="gradient" padding="lg" className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div>
                <p className="text-3xl font-bold text-white">
                  {travel.origin_code || travel.origin.slice(0, 3).toUpperCase()}
                </p>
                <p className="text-sm text-white/40">{travel.origin}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-12 h-px bg-white/20" />
                  <div className="p-2 rounded-xl bg-accent/20">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <div className="w-12 h-px bg-white/20" />
                </div>
                {travel.flight_number && (
                  <span className="text-[10px] text-white/30 font-mono">
                    {travel.flight_number}
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-3xl font-bold text-white">
                  {travel.destination_code || travel.destination.slice(0, 3).toUpperCase()}
                </p>
                <p className="text-sm text-white/40">{travel.destination}</p>
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <Calendar size={14} />
                <span>{format(travelDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <Clock size={14} />
                <span>{format(travelDate, 'h:mm a')}</span>
              </div>
            </div>
            
            {isUpcoming && (
              <div className="mt-3">
                <Badge variant="primary">
                  {formatDistanceToNow(travelDate, { addSuffix: true })}
                </Badge>
              </div>
            )}
          </div>
        </Card>
        
        {/* Traveler Info */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={travel.user_avatar}
                name={travel.user_name || 'User'}
                size="lg"
                hasStory={true}
              />
              <div>
                <p className="font-semibold text-white">{travel.user_name}</p>
                <p className="text-sm text-white/40">{travel.user_profession}</p>
                {travel.user_profile_type && (
                  <span className="text-xs text-white/30">
                    {profileTypeLabels[travel.user_profile_type]}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleFollow}
                disabled={isFollowing}
                className={`p-2.5 rounded-xl transition-colors ${
                  isFollowing 
                    ? 'bg-pink-500/20 text-pink-400' 
                    : 'bg-white/5 text-white/40 hover:bg-pink-500/10 hover:text-pink-400'
                }`}
              >
                <Heart size={18} fill={isFollowing ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          
          {travel.user_bio && (
            <p className="text-sm text-white/50 mb-4">{travel.user_bio}</p>
          )}
          
          <Button
            variant={connectionSent ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            onClick={handleConnect}
            disabled={connectionSent}
          >
            {connectionSent ? (
              <>Request Sent</>
            ) : (
              <>
                <UserPlus size={16} className="mr-2" />
                Connect with {travel.user_name?.split(' ')[0]}
              </>
            )}
          </Button>
        </Card>
        
        {/* Travel Intents */}
        {travel.travel_intents && travel.travel_intents.length > 0 && (
          <Card variant="subtle" padding="md">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-3">
              Open to
            </p>
            <div className="flex flex-wrap gap-2">
              {travel.travel_intents.map((intent) => {
                const intentInfo = TRAVEL_INTENTS[intent.key];
                return (
                  <div
                    key={intent.key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                      intent.is_primary
                        ? 'bg-accent/20 text-accent'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <span>{intentInfo?.icon || '✨'}</span>
                    <span>{intentInfo?.label || intent.key}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
        
        {/* Notes */}
        {travel.notes && (
          <Card variant="subtle" padding="md">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
              Notes
            </p>
            <p className="text-white/70">{travel.notes}</p>
          </Card>
        )}
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {/* TODO: Implement cab share */}}
          >
            <Navigation size={16} className="mr-2" />
            Offer Cab Share
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {/* TODO: Implement message */}}
          >
            <MessageCircle size={16} className="mr-2" />
            Message
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

