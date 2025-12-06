'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Check, X, MessageCircle, Heart, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { usersApi, connectionsApi, followsApi, getAuthToken } from '@/lib/api';
import { User, Connection, Follow } from '@/types';
import { clsx } from 'clsx';

export default function NetworkPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'following' | 'pending' | 'discover'>('connections');
  
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
      const [userData, connectionsData, pendingData, followingData] = await Promise.all([
        usersApi.getMe(),
        connectionsApi.list('accepted'),
        connectionsApi.pending(),
        followsApi.following(),
      ]);
      setUser(userData as User);
      setConnections(connectionsData as Connection[]);
      setPendingRequests(pendingData as Connection[]);
      setFollowing(followingData as Follow[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await usersApi.search({ q: searchQuery, limit: 20 });
      setSearchResults(results as User[]);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  const handleConnect = async (userId: string) => {
    try {
      await connectionsApi.request({
        addressee_id: userId,
        context: 'network',
      });
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      alert(error.message || 'Failed to send connection request');
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
  
  const handleAccept = async (connectionId: string) => {
    try {
      await connectionsApi.accept(connectionId);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to accept request');
    }
  };
  
  const handleReject = async (connectionId: string) => {
    try {
      await connectionsApi.reject(connectionId);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to reject request');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const tabs = [
    { id: 'connections', label: 'Connections', icon: Users, count: connections.length },
    { id: 'following', label: 'Following', icon: Heart, count: following.length },
    { id: 'pending', label: 'Pending', icon: UserPlus, count: pendingRequests.length },
    { id: 'discover', label: 'Discover', icon: Search, count: 0 },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-animated pb-24">
      <Header user={user} />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Network</h1>
          <p className="text-white/50 text-sm">
            Connect with fellow travelers
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant={activeTab === tab.id ? 'primary' : 'default'} size="sm">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        {activeTab === 'connections' && (
          <div className="space-y-3">
            {connections.length > 0 ? (
              connections.map((connection) => (
                <Card key={connection.id} variant="elevated" className="animate-fade-in-up">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={connection.other_user_avatar}
                      name={connection.other_user_name || 'User'}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {connection.other_user_name}
                      </p>
                      <p className="text-sm text-white/50 truncate">
                        {connection.other_user_profession}
                        {connection.other_user_company && ` at ${connection.other_user_company}`}
                      </p>
                    </div>
                    <button className="p-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <Card variant="default" padding="lg" className="text-center">
                <Users size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/70 mb-2">No connections yet</p>
                <p className="text-white/40 text-sm mb-4">Start networking!</p>
                <Button variant="primary" onClick={() => setActiveTab('discover')}>
                  Discover People
                </Button>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'following' && (
          <div className="space-y-3">
            {following.length > 0 ? (
              following.map((follow) => (
                <Card key={follow.id} variant="elevated" className="animate-fade-in-up">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={follow.user_avatar}
                      name={follow.user_name || 'User'}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {follow.user_name}
                      </p>
                      <p className="text-sm text-white/50 truncate">
                        {follow.user_profession}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">Following</Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card variant="default" padding="lg" className="text-center">
                <Heart size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/70 mb-2">Not following anyone yet</p>
                <p className="text-white/40 text-sm">Follow travelers to see their trips</p>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((connection) => (
                <Card key={connection.id} variant="elevated" className="animate-fade-in-up">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={connection.other_user_avatar}
                      name={connection.other_user_name || 'User'}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {connection.other_user_name}
                      </p>
                      <p className="text-sm text-white/50 truncate">
                        {connection.other_user_profession}
                      </p>
                      {connection.message && (
                        <p className="text-xs text-white/40 mt-1 italic line-clamp-1">
                          "{connection.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(connection.id)}
                        className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => handleAccept(connection.id)}
                        className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card variant="default" padding="lg" className="text-center">
                <UserPlus size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/70">No pending requests</p>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'discover' && (
          <div className="space-y-4">
            {/* Search */}
            <Card variant="elevated" padding="md">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, profession..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={18} />}
                  className="flex-1"
                />
                <Button variant="primary" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </Card>
            
            {/* Results */}
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((searchUser) => (
                  <Card key={searchUser.id} variant="elevated" className="animate-fade-in-up">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={searchUser.avatar_url}
                        name={searchUser.name}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {searchUser.name}
                        </p>
                        <p className="text-sm text-white/50 truncate">
                          {searchUser.profession}
                          {searchUser.company && ` at ${searchUser.company}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFollow(searchUser.id)}
                          className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
                          title="Follow"
                        >
                          <Heart size={18} />
                        </button>
                        <button
                          onClick={() => handleConnect(searchUser.id)}
                          className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                          title="Connect"
                        >
                          <UserPlus size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchQuery && (
              <Card variant="default" padding="lg" className="text-center">
                <Search size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/70">No users found</p>
                <p className="text-white/40 text-sm">Try a different search</p>
              </Card>
            )}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
