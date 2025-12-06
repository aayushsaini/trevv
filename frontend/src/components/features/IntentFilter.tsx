'use client';

import { clsx } from 'clsx';

interface IntentFilterProps {
  selected: string | null;
  onChange: (intent: string | null) => void;
}

const quickFilters = [
  { key: null, icon: '✨', label: 'All' },
  { key: 'cab_share', icon: '🚕', label: 'Cab Share' },
  { key: 'office_commute', icon: '🏢', label: 'Commute' },
  { key: 'networking', icon: '👥', label: 'Networking' },
  { key: 'coffee', icon: '☕', label: 'Coffee' },
  { key: 'co_traveller', icon: '🎒', label: 'Co-travel' },
  { key: 'creator_collab', icon: '🎬', label: 'Creators' },
];

export function IntentFilter({ selected, onChange }: IntentFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {quickFilters.map((filter) => (
        <button
          key={filter.key || 'all'}
          onClick={() => onChange(filter.key)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all duration-200 text-sm',
            selected === filter.key
              ? 'bg-accent/20 text-accent'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
          )}
        >
          <span className="text-sm">{filter.icon}</span>
          <span className="font-medium text-xs">{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
