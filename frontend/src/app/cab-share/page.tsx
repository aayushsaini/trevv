'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CabShareCard } from '@/components/features/CabShareCard';
import { usersApi, cabSharesApi, getAuthToken } from '@/lib/api';
import { User, CabShare } from '@/types';

export default function CabSharePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cabShares, setCabShares] = useState<CabShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  
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
      const [userData, cabSharesData] = await Promise.all([
        usersApi.getMe(),
        cabSharesApi.list(),
      ]);
      setUser(userData as User);
      setCabShares(cabSharesData as CabShare[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await cabSharesApi.list({
        origin: searchOrigin || undefined,
        destination: searchDest || undefined,
      });
      setCabShares(data as CabShare[]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoin = async (cabShareId: string) => {
    try {
      await cabSharesApi.join(cabShareId, { seats_needed: 1 });
      loadData(); // Reload data
    } catch (error: any) {
      alert(error.message || 'Failed to join cab share');
    }
  };
  
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
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cab Sharing</h1>
          <p className="text-neutral-500 text-sm">
            Share rides and split costs with travelers
          </p>
        </div>
        
        {/* Search */}
        <Card variant="elevated" padding="md">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="From (area)"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              icon={<MapPin size={18} />}
            />
            <Input
              placeholder="To (airport)"
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              icon={<MapPin size={18} />}
            />
          </div>
          <Button variant="primary" fullWidth onClick={handleSearch}>
            <Search size={18} className="mr-2" />
            Search Rides
          </Button>
        </Card>
        
        {/* Cab Shares List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              Available Rides
            </h2>
            <span className="text-sm text-neutral-500">
              {cabShares.length} found
            </span>
          </div>
          
          {cabShares.length > 0 ? (
            cabShares.map((cabShare) => (
              <CabShareCard
                key={cabShare.id}
                cabShare={cabShare}
                onJoin={() => handleJoin(cabShare.id)}
              />
            ))
          ) : (
            <Card variant="default" padding="lg" className="text-center">
              <p className="text-neutral-500 mb-4">
                No cab shares available. Create one for your trip!
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/travels')}
              >
                Create from Trip
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

