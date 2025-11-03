/*
  # Rental Eaze Database Schema

  ## Overview
  This migration creates the complete database schema for Rental Eaze,
  a peer-to-peer rental marketplace platform.

  ## New Tables

  ### 1. `profiles`
  Extended user profile information linked to auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User email address
  - `full_name` (text) - User's full name
  - `phone` (text, optional) - Contact phone number
  - `location` (text, optional) - User location
  - `avatar_url` (text, optional) - Profile picture URL
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `rental_items`
  Rental item listings created by users
  - `id` (uuid, primary key) - Unique item identifier
  - `owner_id` (uuid, foreign key) - References profiles.id
  - `title` (text) - Item name/title
  - `description` (text) - Detailed item description
  - `category` (text) - Item category (Electronics, Furniture, etc.)
  - `image_url` (text) - Main item image URL
  - `price_per_day` (decimal) - Daily rental price
  - `price_per_week` (decimal) - Weekly rental price
  - `location` (text) - Item location
  - `availability` (boolean) - Whether item is currently available
  - `views` (integer) - Number of times item has been viewed
  - `created_at` (timestamptz) - Listing creation time
  - `updated_at` (timestamptz) - Last listing update

  ### 3. `favorites`
  User's saved/favorited rental items
  - `id` (uuid, primary key) - Unique favorite identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `item_id` (uuid, foreign key) - References rental_items.id
  - `created_at` (timestamptz) - When item was favorited

  ### 4. `messages`
  Messages between users for rental inquiries
  - `id` (uuid, primary key) - Unique message identifier
  - `item_id` (uuid, foreign key) - References rental_items.id
  - `sender_id` (uuid, foreign key) - References profiles.id (message sender)
  - `recipient_id` (uuid, foreign key) - References profiles.id (message recipient)
  - `subject` (text) - Message subject line
  - `message` (text) - Message content
  - `read` (boolean) - Whether message has been read
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### profiles table:
  - Users can view all public profiles
  - Users can insert their own profile during signup
  - Users can update only their own profile
  - Users cannot delete profiles

  #### rental_items table:
  - Anyone can view available rental items
  - Authenticated users can create new listings
  - Users can update only their own listings
  - Users can delete only their own listings

  #### favorites table:
  - Users can view only their own favorites
  - Users can add items to their favorites
  - Users can remove items from their favorites

  #### messages table:
  - Users can view messages where they are sender or recipient
  - Authenticated users can send messages
  - Users can update read status on messages they received
  - Users can delete messages they sent or received

  ## Important Notes
  
  1. Data Safety: All operations use IF EXISTS/IF NOT EXISTS
  2. Security: All tables have RLS enabled with restrictive policies
  3. Defaults: Sensible defaults for booleans, timestamps, and counters
  4. Indexes: Added for frequently queried columns (owner_id, category, location)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  location text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create rental_items table
CREATE TABLE IF NOT EXISTS rental_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  price_per_day decimal(10,2) NOT NULL,
  price_per_week decimal(10,2),
  location text NOT NULL,
  availability boolean DEFAULT true,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;

-- Rental items policies
CREATE POLICY "Anyone can view rental items"
  ON rental_items FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON rental_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own listings"
  ON rental_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own listings"
  ON rental_items FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rental_items_owner ON rental_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_rental_items_category ON rental_items(category);
CREATE INDEX IF NOT EXISTS idx_rental_items_location ON rental_items(location);
CREATE INDEX IF NOT EXISTS idx_rental_items_created ON rental_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);