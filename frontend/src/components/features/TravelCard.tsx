'use client';

import { Plane, Train, Bus, Car, MapPin, Heart, Send, Check, Clock, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TravelPlan } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

interface TravelCardProps {
  travel: TravelPlan;
  onClick?: () => void;
  onTagAlong?: () => void;
  onFollow?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const travelIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  other: MapPin,
};

export function TravelCard({ travel, onClick, onTagAlong, onFollow, showActions = true, compact = false }: TravelCardProps) {
  const Icon = travelIcons[travel.travel_type] || MapPin;
  const travelDate = new Date(travel.travel_date);
  const isUpcoming = travelDate > new Date();
  
  // Get primary intent
  const primaryIntent = travel.travel_intents?.find(i => i.is_primary) || travel.travel_intents?.[0];
  
  // Companion availability
  const hasSlots = travel.max_companions > 0;
  const spotsAvailable = travel.spots_available;
  const isFull = travel.is_full;
  const hasRequested = travel.has_requested;
  const requestStatus = travel.request_status;
  
  // Determine card state
  const isDisabled = isFull && !hasRequested;
  
  return (
    <Card 
      variant="elevated" 
      hover={!isDisabled}
      onClick={isDisabled ? undefined : onClick} 
      padding="none"
      className={`overflow-hidden relative ${isDisabled ? 'opacity-60' : ''}`}
    >
      {/* Availability indicator */}
      {hasSlots && !isFull && (
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
          </div>
        </div>
      )}
      
      {/* Left accent for available trips */}
      {hasSlots && !isFull && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
      )}
      
      {/* Main content */}
      <div className="p-4">
        {/* User row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={travel.user_avatar}
              name={travel.user_name || 'User'}
              size="md"
              hasStory={true}
            />
            <div>
              <p className="font-medium text-white text-sm leading-tight">
                {travel.user_name}
              </p>
              <p className="text-[11px] text-white/30">
                {travel.user_profession || 'Traveler'}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              {onFollow && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onFollow(); }}
                  className="p-1.5 rounded-lg text-white/20 hover:text-pink-400 hover:bg-pink-500/10 transition-colors"
                >
                  <Heart size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Route - simplified */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg font-bold text-white">
              {travel.origin_code || travel.origin.slice(0, 3).toUpperCase()}
            </span>
            <div className="flex items-center gap-1 flex-1">
              <div className="h-px flex-1 bg-white/10" />
              <Icon size={14} className="text-accent" />
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <span className="text-lg font-bold text-white">
              {travel.destination_code || travel.destination.slice(0, 3).toUpperCase()}
            </span>
          </div>
          
          {isUpcoming && (
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium whitespace-nowrap">
              {formatDistanceToNow(travelDate, { addSuffix: false })}
            </span>
          )}
        </div>
        
        {/* Date */}
        <p className="text-xs text-white/30 mb-2">
          {format(travelDate, 'EEEE, MMM d')} · {format(travelDate, 'h:mm a')}
        </p>
        
        {/* Primary intent and companion slots */}
        <div className="flex items-center gap-2 flex-wrap">
          {primaryIntent && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-xs">
              <span>{primaryIntent.icon}</span>
              <span className="text-white/60">{primaryIntent.label}</span>
            </div>
          )}
          
          {/* Companion slots indicator */}
          {hasSlots && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
              isFull 
                ? 'bg-white/5 text-white/40' 
                : 'bg-green-500/10 text-green-400'
            }`}>
              <Users size={12} />
              <span>
                {isFull 
                  ? 'Full' 
                  : `${spotsAvailable} ${spotsAvailable === 1 ? 'spot' : 'spots'} left`
                }
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes as footer - only if exists */}
      {travel.notes && !compact && (
        <div className="px-4 py-2.5 bg-black/20 border-t border-white/5">
          <p className="text-xs text-white/40 line-clamp-1">
            {travel.notes}
          </p>
        </div>
      )}
      
      {/* Tag Along action */}
      {showActions && hasSlots && !isFull && onTagAlong && (
        <div className="px-4 py-3 bg-gradient-to-r from-green-500/5 to-transparent border-t border-white/5">
          {hasRequested ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">
                {requestStatus === 'pending' && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-yellow-400" />
                    Vibe check sent
                  </span>
                )}
                {requestStatus === 'accepted' && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <Check size={12} />
                    You're in!
                  </span>
                )}
                {requestStatus === 'declined' && (
                  <span className="text-white/30">Request declined</span>
                )}
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onTagAlong(); }}
              className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              <Send size={14} />
              Send Vibe Check
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
