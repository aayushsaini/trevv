'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Plane, Train, Bus, Car, Hash, Sparkles, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { IntentSelector } from '@/components/ui/IntentPill';
import { travelsApi } from '@/lib/api';
import { clsx } from 'clsx';

const travelModes = [
  { id: 'flight', label: 'Flight', emoji: '✈️', placeholder: 'Flight number (e.g., 6E 2341)' },
  { id: 'train', label: 'Train', emoji: '🚂', placeholder: 'Train number (e.g., 12301)' },
  { id: 'bus', label: 'Bus', emoji: '🚌', placeholder: 'Bus route (optional)' },
  { id: 'car', label: 'Road Trip', emoji: '🚗', placeholder: 'Vehicle details (optional)' },
  { id: 'other', label: 'Other', emoji: '🌍', placeholder: 'Details (optional)' },
];

const squadSizeOptions = [
  { value: 0, label: 'Solo vibes', desc: "Just me, open to connect" },
  { value: 1, label: '+1 buddy', desc: "Looking for one companion" },
  { value: 2, label: 'Small squad', desc: "Up to 2 can join" },
  { value: 3, label: 'Crew welcome', desc: "Up to 3 can join" },
  { value: 5, label: 'The more the merrier', desc: "Open squad" },
];

export default function NewTravelPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    origin_code: '',
    destination: '',
    destination_code: '',
    travel_date: '',
    travel_type: 'flight',
    flight_number: '',
    notes: '',
    max_companions: 0,
    intents: [] as string[],
    primary_intent: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const currentMode = travelModes.find(m => m.id === formData.travel_type) || travelModes[0];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.origin || !formData.destination || !formData.travel_date) {
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
      const travelDate = new Date(formData.travel_date).toISOString();
      await travelsApi.create({
        ...formData,
        travel_date: travelDate,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          
          <h1 className="text-lg font-bold text-white">
            {step === 1 ? 'Plan Your Journey' : 'Set Your Vibe'}
          </h1>
          
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            <div className={clsx('w-8 h-1 rounded-full transition-colors', step >= 1 ? 'bg-accent' : 'bg-white/10')} />
            <div className={clsx('w-8 h-1 rounded-full transition-colors', step >= 2 ? 'bg-accent' : 'bg-white/10')} />
          </div>
        </div>
      </header>
      
      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <>
              {/* Route Section */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <MapPin size={18} className="text-accent" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Where to?</h2>
                </div>
                
                <div className="space-y-4">
                  {/* From */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                    <Input
                      name="origin"
                      placeholder="From (city or station)"
                      value={formData.origin}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  
                  {/* Dotted line connector */}
                  <div className="flex items-center pl-[18px]">
                    <div className="h-6 border-l-2 border-dashed border-white/10" />
                  </div>
                  
                  {/* To */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" />
                    <Input
                      name="destination"
                      placeholder="To (city or station)"
                      value={formData.destination}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </Card>
              
              {/* When */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <Calendar size={18} className="text-accent" />
                  </div>
                  <h2 className="text-base font-semibold text-white">When?</h2>
                </div>
                
                <Input
                  name="travel_date"
                  type="datetime-local"
                  value={formData.travel_date}
                  onChange={handleChange}
                  required
                />
              </Card>
              
              {/* How */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-base font-semibold text-white mb-4">How are you traveling?</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {travelModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, travel_type: mode.id })}
                      className={clsx(
                        'flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border transition-all min-w-[72px]',
                        formData.travel_type === mode.id
                          ? 'bg-accent/20 border-accent/40 text-accent'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      )}
                    >
                      <span className="text-xl mb-1">{mode.emoji}</span>
                      <span className="text-[10px] font-medium whitespace-nowrap">{mode.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Optional details input */}
                <div className="mt-4">
                  <Input
                    name="flight_number"
                    placeholder={currentMode.placeholder}
                    value={formData.flight_number}
                    onChange={handleChange}
                    icon={<Hash size={16} />}
                  />
                </div>
              </Card>
              
              {/* Notes */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-base font-semibold text-white mb-4">Anything else?</h2>
                <textarea
                  name="notes"
                  placeholder="Share what you're looking for... (cab share, coffee meetup, local tips)"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 resize-none text-sm"
                />
              </Card>
            </>
          ) : (
            <>
              {/* Squad Size */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Users size={18} className="text-green-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Squad size</h2>
                </div>
                <p className="text-white/40 text-sm mb-5">
                  How many travel buddies can tag along?
                </p>
                
                <div className="space-y-2">
                  {squadSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, max_companions: option.value })}
                      className={clsx(
                        'w-full flex items-center justify-between p-4 rounded-xl border transition-all',
                        formData.max_companions === option.value
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-white/30">{option.desc}</p>
                      </div>
                      {formData.max_companions === option.value && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
              
              {/* Intent Selection */}
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <Sparkles size={18} className="text-accent" />
                  </div>
                  <h2 className="text-base font-semibold text-white">What's your vibe?</h2>
                </div>
                <p className="text-white/40 text-sm mb-5">
                  Help others know what you're open to
                </p>
                
                <IntentSelector
                  selected={formData.intents}
                  primaryIntent={formData.primary_intent}
                  onChange={(intents, primary) => setFormData({
                    ...formData,
                    intents,
                    primary_intent: primary || '',
                  })}
                  maxSelections={5}
                />
              </Card>
              
              {/* Preview */}
              <Card variant="gradient" padding="lg" glow>
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Preview</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">
                      {formData.origin_code || formData.origin.slice(0, 3).toUpperCase()}
                    </span>
                    <ArrowRight size={16} className="text-white/30" />
                    <span className="text-xl font-bold text-white">
                      {formData.destination_code || formData.destination.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xl">{currentMode.emoji}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.max_companions > 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      +{formData.max_companions} spots
                    </span>
                  )}
                  {formData.intents.slice(0, 2).map((key) => (
                    <span 
                      key={key}
                      className="px-2 py-1 rounded-full bg-white/10 text-white/60 text-xs"
                    >
                      {key.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </Card>
            </>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="group"
          >
            {step === 1 ? (
              <>
                Next: Set Your Vibe
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              'Post Journey'
            )}
          </Button>
          
          {step === 2 && (
            <button
              type="button"
              className="w-full py-3 text-white/40 text-sm hover:text-white/60 transition-colors"
              onClick={() => {
                setFormData({ ...formData, intents: [], primary_intent: '', max_companions: 0 });
                handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
            >
              Skip for now
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
