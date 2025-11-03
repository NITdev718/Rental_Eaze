import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RentalItem {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  price_per_day: number;
  price_per_week?: number;
  location: string;
  availability: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  item_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
  item?: RentalItem;
}
