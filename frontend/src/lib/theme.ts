/**
 * Theme and Accent Color Management
 */

import { ACCENT_COLORS, AccentColorKey } from '@/types';

const ACCENT_STORAGE_KEY = 'travelconnect_accent';

export function getAccentColor(): AccentColorKey {
  if (typeof window === 'undefined') return 'orange';
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  if (stored && stored in ACCENT_COLORS) {
    return stored as AccentColorKey;
  }
  return 'orange';
}

export function setAccentColor(color: AccentColorKey) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCENT_STORAGE_KEY, color);
  applyAccentColor(color);
}

export function applyAccentColor(color: AccentColorKey) {
  if (typeof window === 'undefined') return;
  
  const colorData = ACCENT_COLORS[color];
  const root = document.documentElement;
  
  // Set CSS custom properties
  root.style.setProperty('--accent-color', colorData.value);
  root.style.setProperty('--accent-gradient', colorData.gradient);
  
  // Also update Tailwind classes dynamically
  root.setAttribute('data-accent', color);
}

export function initializeTheme() {
  if (typeof window === 'undefined') return;
  const color = getAccentColor();
  applyAccentColor(color);
}






