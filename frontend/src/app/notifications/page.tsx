'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, UserPlus, Heart, Plane, MessageCircle, Check, X, ChevronLeft } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { usersApi, connectionsApi, getAuthToken } from '@/lib/api';
import { User, Connection } from '@/types';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'follow' | 'connection_request' | 'connection_accepted' | 'trip_match' | 'message';
  user_name: string;
  user_avatar?: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action_id?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      const [userData, pendingData] = await Promise.all([
        usersApi.getMe(),
        connectionsApi.pending(),
      ]);
      setUser(userData as User);
      setPendingConnections(pendingData as Connection[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async (connectionId: string) => {
    try {
      await connectionsApi.accept(connectionId);
      loadData();
    } catch (error) {
      console.error('Failed to accept:', error);
    }
  };
  
  const handleReject = async (connectionId: string) => {
    try {
      await connectionsApi.reject(connectionId);
      loadData();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };
  
  // Generate sample notifications (in real app, these would come from API)
  const notifications: Notification[] = [
    ...pendingConnections.map((conn) => ({
      id: conn.id,
      type: 'connection_request' as const,
      user_name: conn.other_user_name || 'Someone',
      user_avatar: conn.other_user_avatar,
      message: 'wants to connect with you',
      timestamp: new Date(conn.created_at),
      read: false,
      action_id: conn.id,
    })),
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return Heart;
      case 'connection_request': return UserPlus;
      case 'connection_accepted': return Check;
      case 'trip_match': return Plane;
      case 'message': return MessageCircle;
      default: return Bell;
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={20} className="text-white/60" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Notifications</h1>
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-medium">
              {notifications.length}
            </span>
          )}
        </div>
      </header>
      
      <main className="max-w-lg mx-auto px-4 py-2 space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            
            return (
              <Card
                key={notif.id}
                variant={notif.read ? 'subtle' : 'elevated'}
                padding="md"
                className={clsx(
                  'flex items-start gap-3',
                  !notif.read && 'border-l-2 border-orange-500'
                )}
              >
                <Avatar
                  src={notif.user_avatar}
                  name={notif.user_name}
                  size="md"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="text-white font-medium">{notif.user_name}</span>
                    <span className="text-white/40"> {notif.message}</span>
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                  </p>
                </div>
                
                {notif.type === 'connection_request' && notif.action_id && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleReject(notif.action_id!)}
                      className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => handleAccept(notif.action_id!)}
                      className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                )}
                
                {notif.type !== 'connection_request' && (
                  <div className="p-2 rounded-lg bg-white/5">
                    <Icon size={14} className="text-white/30" />
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card variant="subtle" padding="lg" className="text-center mt-8">
            <Bell size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-1">No notifications yet</p>
            <p className="text-white/20 text-xs">
              When someone follows you or sends a connection request, you'll see it here
            </p>
          </Card>
        )}
        
        {/* Activity Types Info */}
        <div className="pt-6">
          <p className="text-xs text-white/20 text-center">
            We'll notify you about connection requests, new followers, and travel matches
          </p>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

