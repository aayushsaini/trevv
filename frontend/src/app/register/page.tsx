'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, Building, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi, setAuthToken } from '@/lib/api';
import { clsx } from 'clsx';

const profileTypes = [
  { key: 'creator', emoji: '🎬', label: 'Creator' },
  { key: 'founder', emoji: '🚀', label: 'Founder' },
  { key: 'professional', emoji: '💼', label: 'Professional' },
  { key: 'traveler', emoji: '🎒', label: 'Traveler' },
  { key: 'explorer', emoji: '🌍', label: 'Explorer' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '',
    company: '',
    profile_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await authApi.register(formData);
      const loginResponse = await authApi.login(formData.email, formData.password);
      setAuthToken(loginResponse.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-animated relative overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative p-4 flex items-center justify-between">
        <button
          onClick={() => step === 1 ? router.push('/') : setStep(1)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={24} className="text-white/60" />
        </button>
        
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-8 h-1 rounded-full transition-colors',
            step >= 1 ? 'bg-orange-500' : 'bg-white/10'
          )} />
          <div className={clsx(
            'w-8 h-1 rounded-full transition-colors',
            step >= 2 ? 'bg-orange-500' : 'bg-white/10'
          )} />
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </header>
      
      <div className="relative flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 pb-12">
        {/* Title */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
            <Sparkles size={12} />
            {step === 1 ? 'Get started' : 'Almost there'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Create your account' : 'Tell us about yourself'}
          </h1>
          <p className="text-white/50">
            {step === 1 ? 'Join the travel network' : 'Help others find you'}
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
            
            {step === 1 ? (
              <>
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<User size={20} />}
                  required
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail size={20} />}
                  required
                />
                
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={20} />}
                  required
                />
              </>
            ) : (
              <>
                {/* Profile Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {profileTypes.map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, profile_type: type.key })}
                        className={clsx(
                          'p-3 rounded-2xl border text-center transition-all',
                          formData.profile_type === type.key
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        )}
                      >
                        <span className="text-2xl block mb-1">{type.emoji}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Input
                  label="What do you do?"
                  name="profession"
                  type="text"
                  placeholder="e.g. Software Engineer, Content Creator"
                  value={formData.profession}
                  onChange={handleChange}
                  icon={<Briefcase size={20} />}
                />
                
                <Input
                  label="Company / Brand (optional)"
                  name="company"
                  type="text"
                  placeholder="e.g. Google, Self-employed"
                  value={formData.company}
                  onChange={handleChange}
                  icon={<Building size={20} />}
                />
              </>
            )}
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {step === 1 ? 'Continue' : 'Create Account'}
            </Button>
          </form>
        </Card>
        
        {/* Terms */}
        {step === 2 && (
          <p className="text-center text-white/30 text-xs mt-4 animate-fade-in-up">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-orange-400">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-orange-400">Privacy Policy</Link>
          </p>
        )}
        
        {/* Login Link */}
        <p className="text-center text-white/50 mt-6 animate-fade-in-up stagger-2">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
