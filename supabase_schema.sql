-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for avatars
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

-- Drop table safely if it already exists
DROP TABLE IF EXISTS student_profiles;

-- Add onboarding status to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_onboarding_complete BOOLEAN DEFAULT false;

-- Create table for detailed student profiles (Onboarding Data)
CREATE TABLE student_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Academic Background
  education_level TEXT,
  degree_major TEXT,
  graduation_year INT,
  gpa TEXT,

  -- Study Goals
  intended_degree TEXT,
  field_of_study TEXT,
  preferred_countries TEXT[], -- Array of strings
  target_intake_year INT,

  -- Budget & Funding
  budget_range TEXT,
  funding_source TEXT,

  -- Readiness
  exam_ielts_status TEXT,
  exam_ielts_score TEXT,
  exam_gre_status TEXT,
  exam_gre_score TEXT,
  sop_status TEXT
);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own student profile"
ON student_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own student profile"
ON student_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own student profile"
ON student_profiles
FOR UPDATE

-- [AI Counsellor Expansion]

-- 1. Universities Table
CREATE TABLE universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    country TEXT,
    ranking INT,
    acceptance_rate FLOAT, -- e.g. 0.05 for 5%
    cost_range TEXT, -- 'High', 'Medium', 'Low'
    logo_url TEXT,
    tags TEXT[], -- Array of strings e.g. ['Ivy League', 'Tech', 'Safe']
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for universities (Public Read, Admin Write)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view universities" ON universities FOR SELECT USING (true);


-- 2. University Shortlist Table
CREATE TABLE university_shortlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    university_id UUID REFERENCES universities(id) NOT NULL,
    category TEXT CHECK (category IN ('Dream', 'Target', 'Safe')),
    status TEXT DEFAULT 'Shortlisted', -- 'Shortlisted', 'Locked'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, university_id)
);

-- Enable RLS for shortlist
ALTER TABLE university_shortlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own shortlist" ON university_shortlist
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 3. Chat Messages Table (Persistent AI History)
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for chat
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own chat history" ON chat_messages
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 4. Seed Data: Universities
INSERT INTO universities (name, location, country, ranking, acceptance_rate, cost_range, tags) VALUES
('Stanford University', 'California', 'USA', 2, 0.04, 'High', ARRAY['Top Tier', 'Tech', 'Entrepreneurship']),
('Massachusetts Institute of Technology (MIT)', 'Massachusetts', 'USA', 1, 0.04, 'High', ARRAY['Top Tier', 'STEM', 'Research']),
('Harvard University', 'Massachusetts', 'USA', 3, 0.03, 'High', ARRAY['Ivy League', 'Law', 'Business']),
('University of California, Berkeley', 'California', 'USA', 10, 0.11, 'Medium', ARRAY['Public Ivy', 'Research', 'Tech']),
('Arizona State University', 'Arizona', 'USA', 156, 0.88, 'Low', ARRAY['Public', 'Large', 'Safe']),
('University of Toronto', 'Toronto', 'Canada', 21, 0.43, 'Medium', ARRAY['Public', 'Research', 'Global']),
('Imperial College London', 'London', 'UK', 6, 0.14, 'High', ARRAY['STEM', 'Global', 'Urban']),
('National University of Singapore (NUS)', 'Singapore', 'Singapore', 11, 0.05, 'Medium', ARRAY['Asian Top', 'Tech', 'Global']);

