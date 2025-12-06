'use client';

import { Car, Clock, MapPin, Users, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CabShare } from '@/types';
import { format } from 'date-fns';

interface CabShareCardProps {
  cabShare: CabShare;
  onJoin?: () => void;
}

export function CabShareCard({ cabShare, onJoin }: CabShareCardProps) {
  const pickupTime = new Date(cabShare.pickup_time);
  
  return (
    <Card variant="elevated" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={cabShare.creator_avatar}
            name={cabShare.creator_name || 'User'}
            size="md"
          />
          <div>
            <p className="font-semibold text-neutral-900">{cabShare.creator_name}</p>
            <p className="text-xs text-neutral-500">Organizer</p>
          </div>
        </div>
        <Badge 
          variant={cabShare.available_seats > 2 ? 'success' : 'warning'}
          size="md"
        >
          {cabShare.available_seats} seats left
        </Badge>
      </div>
      
      {/* Route */}
      <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-[#E8654B]" />
            <div className="w-0.5 h-8 bg-neutral-300 my-1" />
            <div className="w-3 h-3 rounded-full bg-neutral-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Pickup</p>
              <p className="font-medium text-neutral-900 text-sm">
                {cabShare.pickup_location}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Dropoff</p>
              <p className="font-medium text-neutral-900 text-sm">
                {cabShare.dropoff_location}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Clock size={16} />
          <span>{format(pickupTime, 'MMM d, h:mm a')}</span>
        </div>
        {cabShare.price_per_seat && (
          <div className="flex items-center gap-0.5 text-[#E8654B] font-semibold">
            <IndianRupee size={14} />
            <span>{cabShare.price_per_seat}/seat</span>
          </div>
        )}
      </div>
      
      {/* Participants */}
      {cabShare.participants.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {cabShare.participants.slice(0, 3).map((p) => (
              <Avatar
                key={p.id}
                src={p.user_avatar}
                name={p.user_name || 'User'}
                size="sm"
              />
            ))}
          </div>
          <span className="text-sm text-neutral-500">
            {cabShare.participants.length} joined
          </span>
        </div>
      )}
      
      {/* Action */}
      {cabShare.available_seats > 0 && onJoin && (
        <Button 
          variant="primary" 
          fullWidth 
          onClick={onJoin}
        >
          <Car size={18} className="mr-2" />
          Join Ride
        </Button>
      )}
    </Card>
  );
}






