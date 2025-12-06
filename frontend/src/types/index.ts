// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  profession?: string;
  company?: string;
  bio?: string;
  location?: string;
  current_city?: string;
  profile_type?: string;
  accent_color?: string;
  is_verified: boolean;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

// Profile types
export type ProfileType = 'creator' | 'founder' | 'traveler' | 'professional' | 'explorer';

// Travel types
export type TravelType = 'flight' | 'train' | 'bus' | 'car' | 'other';
export type TravelStatus = 'planned' | 'active' | 'completed' | 'cancelled';

// Travel Intent
export interface TravelIntent {
  key: string;
  icon: string;
  label: string;
  description: string;
  is_primary?: boolean;
}

export interface TravelPlan {
  id: string;
  user_id: string;
  origin: string;
  origin_code?: string;
  destination: string;
  destination_code?: string;
  travel_date: string;
  travel_type: TravelType;
  flight_number?: string;
  notes?: string;
  status: TravelStatus;
  is_public: string;
  max_companions: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profession?: string;
  user_profile_type?: string;
  user_bio?: string;
  cab_share_count: number;
  travel_intents: TravelIntent[];
  intents?: string[];
  primary_intent?: string;
  // Companion availability
  accepted_companions: number;
  spots_available: number; // -1 = unlimited
  is_full: boolean;
  has_requested: boolean;
  request_status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
}

export interface TravelRequest {
  id: string;
  travel_id: string;
  requester_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
  responded_at?: string;
  requester_name?: string;
  requester_avatar?: string;
  requester_profession?: string;
  requester_profile_type?: string;
  travel_origin?: string;
  travel_destination?: string;
  travel_date?: string;
}

// Connection types
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  message?: string;
  context?: string;
  travel_plan_id?: string;
  created_at: string;
  other_user_name?: string;
  other_user_avatar?: string;
  other_user_profession?: string;
  other_user_company?: string;
}

// Cab share types
export interface CabShare {
  id: string;
  travel_plan_id: string;
  creator_id: string;
  pickup_location: string;
  pickup_coordinates?: string;
  dropoff_location: string;
  dropoff_coordinates?: string;
  pickup_time: string;
  total_seats: number;
  available_seats: number;
  price_per_seat?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  creator_name?: string;
  creator_avatar?: string;
  origin?: string;
  destination?: string;
  travel_date?: string;
  participants: CabShareParticipant[];
}

export interface CabShareParticipant {
  id: string;
  user_id: string;
  seats_booked: number;
  pickup_point?: string;
  is_confirmed: boolean;
  user_name?: string;
  user_avatar?: string;
}

// Follow types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  notify_new_travel: boolean;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profession?: string;
  user_bio?: string;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_followed_by: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

// Auth types
export interface AuthToken {
  access_token: string;
  token_type: string;
}

// Accent colors
export const ACCENT_COLORS = {
  orange: { name: 'Sunset Orange', value: '#f97316', gradient: 'from-orange-500 to-amber-500' },
  blue: { name: 'Ocean Blue', value: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' },
  purple: { name: 'Royal Purple', value: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
  pink: { name: 'Rose Pink', value: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
  green: { name: 'Forest Green', value: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  teal: { name: 'Teal Wave', value: '#14b8a6', gradient: 'from-teal-500 to-cyan-500' },
};

export type AccentColorKey = keyof typeof ACCENT_COLORS;

// Predefined intents with metadata
export const TRAVEL_INTENTS: Record<string, TravelIntent> = {
  networking: { key: "networking", icon: "👥", label: "Open for Networking", description: "Meet professionals & expand your network" },
  coffee: { key: "coffee", icon: "☕", label: "Grab a Coffee", description: "Casual meetup for coffee & conversation" },
  co_traveller: { key: "co_traveller", icon: "🎒", label: "Looking for Co-traveller", description: "Find someone to travel together" },
  cab_share: { key: "cab_share", icon: "🚕", label: "Cab Sharing", description: "Share a cab to save costs" },
  office_commute: { key: "office_commute", icon: "🏢", label: "Office Commute", description: "Daily commute buddy to office" },
  brand_collab: { key: "brand_collab", icon: "🤝", label: "Brand Collaborations", description: "Open to brand deals & partnerships" },
  creator_collab: { key: "creator_collab", icon: "🎬", label: "Creator Collab", description: "Looking to collaborate with creators" },
  startup_connect: { key: "startup_connect", icon: "🚀", label: "Startup Networking", description: "Connect with founders & investors" },
  local_guide: { key: "local_guide", icon: "🗺️", label: "Need Local Guide", description: "Looking for local tips & guidance" },
  be_guide: { key: "be_guide", icon: "🧭", label: "Can Be Your Guide", description: "Happy to show you around" },
  food_buddy: { key: "food_buddy", icon: "🍽️", label: "Food Buddy", description: "Explore local cuisine together" },
  adventure: { key: "adventure", icon: "⛰️", label: "Adventure Partner", description: "Looking for adventure activities" },
  work_remote: { key: "work_remote", icon: "💻", label: "Remote Work Buddy", description: "Co-working space companion" },
  photography: { key: "photography", icon: "📸", label: "Photography Partner", description: "Explore & capture moments together" },
  just_vibes: { key: "just_vibes", icon: "✨", label: "Just Good Vibes", description: "Open to meeting cool people" },
};
