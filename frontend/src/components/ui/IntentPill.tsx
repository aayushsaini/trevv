'use client';

import { clsx } from 'clsx';
import { TRAVEL_INTENTS } from '@/types';

interface IntentPillProps {
  intentKey: string;
  selected?: boolean;
  primary?: boolean;
  size?: 'sm' | 'md';
  onClick?: () => void;
  showDescription?: boolean;
}

export function IntentPill({
  intentKey,
  selected = false,
  primary = false,
  size = 'md',
  onClick,
  showDescription = false,
}: IntentPillProps) {
  const intent = TRAVEL_INTENTS[intentKey];
  if (!intent) return null;
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center rounded-lg font-medium transition-all duration-200',
        sizes[size],
        selected
          ? primary
            ? 'bg-accent/20 text-accent'
            : 'bg-white/10 text-white/70'
          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60',
        onClick && 'cursor-pointer'
      )}
    >
      <span>{intent.icon}</span>
      <span>{intent.label}</span>
      {showDescription && (
        <span className="text-white/30 ml-1 hidden sm:inline">
          • {intent.description}
        </span>
      )}
    </button>
  );
}

// Multiple intent selector component
interface IntentSelectorProps {
  selected: string[];
  primaryIntent?: string;
  onChange: (intents: string[], primary?: string) => void;
  maxSelections?: number;
}

export function IntentSelector({
  selected,
  primaryIntent,
  onChange,
  maxSelections = 5,
}: IntentSelectorProps) {
  const handleToggle = (key: string) => {
    if (selected.includes(key)) {
      const newSelected = selected.filter(k => k !== key);
      const newPrimary = primaryIntent === key ? newSelected[0] : primaryIntent;
      onChange(newSelected, newPrimary);
    } else if (selected.length < maxSelections) {
      const newSelected = [...selected, key];
      onChange(newSelected, primaryIntent || key);
    }
  };
  
  const handleSetPrimary = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected, key);
    }
  };
  
  const categories = {
    'Networking': ['networking', 'coffee', 'startup_connect'],
    'Travel Buddy': ['co_traveller', 'adventure', 'food_buddy', 'photography'],
    'Collaboration': ['brand_collab', 'creator_collab'],
    'Practical': ['cab_share', 'office_commute', 'local_guide', 'be_guide', 'work_remote'],
    'Social': ['just_vibes'],
  };
  
  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([category, keys]) => (
        <div key={category}>
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keys.map((key) => (
              <div key={key} className="relative group">
                <IntentPill
                  intentKey={key}
                  selected={selected.includes(key)}
                  primary={primaryIntent === key}
                  onClick={() => handleToggle(key)}
                />
                {selected.includes(key) && primaryIntent !== key && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(key);
                    }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Set as primary"
                  >
                    ★
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-white/20">
        Select up to {maxSelections} • {selected.length}/{maxSelections} selected
      </p>
    </div>
  );
}
