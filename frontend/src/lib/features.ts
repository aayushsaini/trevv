/**
 * Feature Flags Configuration
 */

export interface Features {
  cabSharing: boolean;
  flightTracking: boolean;
  networking: boolean;
  chat: boolean;
  notifications: boolean;
  aiMatching: boolean;
}

export const features: Features = {
  cabSharing: process.env.NEXT_PUBLIC_FEATURE_CAB_SHARING !== 'false',
  flightTracking: process.env.NEXT_PUBLIC_FEATURE_FLIGHT_TRACKING !== 'false',
  networking: process.env.NEXT_PUBLIC_FEATURE_NETWORKING !== 'false',
  chat: process.env.NEXT_PUBLIC_FEATURE_CHAT !== 'false',
  notifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS !== 'false',
  aiMatching: process.env.NEXT_PUBLIC_FEATURE_AI_MATCHING === 'true',
};
