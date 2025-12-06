'use client';

import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  storyViewed?: boolean;
  showStoryRing?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  name,
  size = 'md',
  hasStory = false,
  storyViewed = false,
  showStoryRing = true,
  className,
  onClick,
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const ringPadding = {
    xs: 'p-[1px]',
    sm: 'p-[2px]',
    md: 'p-[2px]',
    lg: 'p-[2px]',
    xl: 'p-[3px]',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate gradient based on name
  const gradients = [
    'from-orange-500 to-amber-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-blue-500',
  ];

  const gradientIndex = name.charCodeAt(0) % gradients.length;

  // Story ring gradient (Instagram-like)
  const storyRingClass = hasStory && showStoryRing
    ? storyViewed
      ? 'bg-white/20' // Viewed story - grey ring
      : 'bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500' // Active story - colorful ring
    : 'bg-transparent';

  const avatarContent = src ? (
    <img
      src={src}
      alt={name}
      className={clsx(
        'rounded-full object-cover',
        sizes[size],
      )}
    />
  ) : (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-semibold text-white',
        `bg-gradient-to-br ${gradients[gradientIndex]}`,
        sizes[size],
      )}
    >
      {initials}
    </div>
  );

  // If has story, wrap with ring
  if (hasStory && showStoryRing) {
    return (
      <div
        onClick={onClick}
        className={clsx(
          'inline-flex rounded-full',
          storyRingClass,
          ringPadding[size],
          onClick && 'cursor-pointer',
          className
        )}
      >
        <div className="rounded-full bg-[#0a0a0f] p-[2px]">
          {avatarContent}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className={clsx(onClick && 'cursor-pointer', className)}>
      {avatarContent}
    </div>
  );
}
