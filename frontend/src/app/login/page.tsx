'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      setAuthToken(response.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-animated relative overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative p-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={24} className="text-white/60" />
        </button>
      </header>
      
      <div className="relative flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 pb-12">
        {/* Title */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
            <Sparkles size={12} />
            Welcome back
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sign in to continue
          </h1>
          <p className="text-white/50">
            Your travel network awaits
          </p>
        </div>
        
        {/* Form */}
        <Card variant="elevated" padding="lg" className="animate-fade-in-up stagger-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
              required
            />
            
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </Card>
        
        {/* Sign Up Link */}
        <p className="text-center text-white/50 mt-6 animate-fade-in-up stagger-2">
          Don't have an account?{' '}
          <Link href="/register" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
