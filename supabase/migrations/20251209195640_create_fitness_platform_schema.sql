/*
  # Fitness Platform - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for a fitness tracking platform
  with support for users, trainers, workouts, exercises, progress tracking, and analytics.

  ## New Tables Created

  ### 1. user_profiles
  Extended user information beyond auth.users
  - `id` (uuid, FK to auth.users) - Primary key
  - `full_name` (text) - User's full name
  - `age` (integer) - User's age
  - `gender` (text) - User's gender
  - `height_cm` (numeric) - Height in centimeters
  - `weight_kg` (numeric) - Current weight in kilograms
  - `fitness_goal` (text) - Goal: weight_loss, muscle_gain, maintenance, endurance
  - `fitness_level` (text) - Level: beginner, intermediate, advanced
  - `role` (text) - USER, TRAINER, or ADMIN
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. exercises
  Library of available exercises
  - `id` (uuid) - Primary key
  - `name` (text) - Exercise name
  - `description` (text) - Detailed description
  - `video_url` (text) - Demo video link
  - `muscle_groups` (text[]) - Target muscle groups
  - `equipment_type` (text) - Required equipment
  - `difficulty_level` (text) - beginner, intermediate, advanced
  - `exercise_type` (text) - compound, isolation
  - `created_by` (uuid, FK) - User who created (null for system exercises)
  - `is_public` (boolean) - Available to all users
  - `created_at` (timestamptz)

  ### 3. workouts
  Workout templates and plans
  - `id` (uuid) - Primary key
  - `created_by` (uuid, FK) - Creator user ID
  - `name` (text) - Workout name
  - `description` (text) - Workout description
  - `workout_type` (text) - strength, cardio, yoga, flexibility, sports
  - `duration_minutes` (integer) - Estimated duration
  - `difficulty_level` (text) - beginner, intermediate, advanced
  - `is_template` (boolean) - Is this a reusable template
  - `is_public` (boolean) - Visible to other users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. workout_exercises
  Junction table linking workouts to exercises with details
  - `id` (uuid) - Primary key
  - `workout_id` (uuid, FK) - Reference to workout
  - `exercise_id` (uuid, FK) - Reference to exercise
  - `section` (text) - warmup, main, cooldown
  - `order_index` (integer) - Order in workout
  - `sets` (integer) - Number of sets
  - `reps` (integer) - Repetitions per set
  - `weight_kg` (numeric) - Suggested weight
  - `duration_seconds` (integer) - For timed exercises
  - `rest_seconds` (integer) - Rest between sets
  - `notes` (text) - Additional instructions

  ### 5. scheduled_workouts
  Calendar of planned workouts
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK) - User scheduling the workout
  - `workout_id` (uuid, FK) - Reference to workout
  - `scheduled_date` (date) - Date of workout
  - `scheduled_time` (time) - Time of workout
  - `status` (text) - planned, completed, skipped, in_progress
  - `assigned_by` (uuid, FK) - Trainer who assigned (null if self-assigned)
  - `notes` (text) - User notes
  - `created_at` (timestamptz)

  ### 6. workout_logs
  Records of completed workouts
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK) - User who performed workout
  - `workout_id` (uuid, FK) - Reference to workout
  - `scheduled_workout_id` (uuid, FK) - Link to scheduled workout if applicable
  - `completed_at` (timestamptz) - When workout was completed
  - `duration_minutes` (integer) - Actual duration
  - `overall_rpe` (integer) - Rate of Perceived Exertion (1-10)
  - `notes` (text) - User notes about workout
  - `feeling` (text) - How user felt: great, good, okay, tired, exhausted
  - `created_at` (timestamptz)

  ### 7. exercise_logs
  Detailed logs of individual exercises performed
  - `id` (uuid) - Primary key
  - `workout_log_id` (uuid, FK) - Reference to workout log
  - `exercise_id` (uuid, FK) - Reference to exercise
  - `set_number` (integer) - Which set
  - `reps_completed` (integer) - Actual reps
  - `weight_kg` (numeric) - Actual weight used
  - `duration_seconds` (integer) - For timed exercises
  - `rpe` (integer) - Per-set RPE
  - `notes` (text) - Notes about this set
  - `created_at` (timestamptz)

  ### 8. trainer_clients
  Relationship between trainers and their clients
  - `id` (uuid) - Primary key
  - `trainer_id` (uuid, FK) - Trainer user ID
  - `client_id` (uuid, FK) - Client user ID
  - `status` (text) - pending, active, inactive
  - `started_at` (timestamptz) - When relationship started
  - `notes` (text) - Trainer notes about client
  - `created_at` (timestamptz)

  ### 9. workout_comments
  Comments from trainers on client workouts
  - `id` (uuid) - Primary key
  - `workout_log_id` (uuid, FK) - Reference to workout log
  - `commenter_id` (uuid, FK) - User making comment
  - `comment` (text) - Comment text
  - `created_at` (timestamptz)

  ### 10. body_measurements
  Track body measurements over time
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK) - User ID
  - `measured_at` (date) - Measurement date
  - `weight_kg` (numeric) - Body weight
  - `body_fat_percentage` (numeric) - Body fat %
  - `chest_cm` (numeric) - Chest measurement
  - `waist_cm` (numeric) - Waist measurement
  - `hips_cm` (numeric) - Hip measurement
  - `arms_cm` (numeric) - Arm measurement
  - `legs_cm` (numeric) - Leg measurement
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Trainers can view their clients' data
  - Public exercises and workouts visible to all authenticated users
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'TRAINER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fitness_goal AS ENUM ('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE workout_status AS ENUM ('planned', 'in_progress', 'completed', 'skipped');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age integer CHECK (age > 0 AND age < 150),
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5,2) CHECK (height_cm > 0),
  weight_kg numeric(5,2) CHECK (weight_kg > 0),
  fitness_goal text DEFAULT 'maintenance' CHECK (fitness_goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility')),
  fitness_level text DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  role text DEFAULT 'USER' CHECK (role IN ('USER', 'TRAINER', 'ADMIN')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  video_url text,
  muscle_groups text[] DEFAULT '{}',
  equipment_type text DEFAULT 'bodyweight' CHECK (equipment_type IN ('bodyweight', 'dumbbells', 'barbell', 'machine', 'cable', 'kettlebell', 'resistance_band', 'other')),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  exercise_type text DEFAULT 'compound' CHECK (exercise_type IN ('compound', 'isolation')),
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  workout_type text DEFAULT 'strength' CHECK (workout_type IN ('strength', 'cardio', 'yoga', 'flexibility', 'sports', 'crossfit', 'hiit')),
  duration_minutes integer DEFAULT 60 CHECK (duration_minutes > 0),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Workout Exercises Junction Table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  section text DEFAULT 'main' CHECK (section IN ('warmup', 'main', 'cooldown')),
  order_index integer NOT NULL DEFAULT 0,
  sets integer DEFAULT 3 CHECK (sets > 0),
  reps integer CHECK (reps > 0),
  weight_kg numeric(6,2) CHECK (weight_kg >= 0),
  duration_seconds integer CHECK (duration_seconds > 0),
  rest_seconds integer DEFAULT 60 CHECK (rest_seconds >= 0),
  notes text DEFAULT '',
  UNIQUE(workout_id, order_index)
);

-- 5. Scheduled Workouts Table
CREATE TABLE IF NOT EXISTS scheduled_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time time,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
  assigned_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 6. Workout Logs Table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  scheduled_workout_id uuid REFERENCES scheduled_workouts(id) ON DELETE SET NULL,
  completed_at timestamptz DEFAULT now(),
  duration_minutes integer CHECK (duration_minutes > 0),
  overall_rpe integer CHECK (overall_rpe >= 1 AND overall_rpe <= 10),
  notes text DEFAULT '',
  feeling text CHECK (feeling IN ('great', 'good', 'okay', 'tired', 'exhausted')),
  created_at timestamptz DEFAULT now()
);

-- 7. Exercise Logs Table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number > 0),
  reps_completed integer CHECK (reps_completed > 0),
  weight_kg numeric(6,2) CHECK (weight_kg >= 0),
  duration_seconds integer CHECK (duration_seconds > 0),
  rpe integer CHECK (rpe >= 1 AND rpe <= 10),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 8. Trainer-Client Relationships Table
CREATE TABLE IF NOT EXISTS trainer_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  started_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_id, client_id)
);

-- 9. Workout Comments Table
CREATE TABLE IF NOT EXISTS workout_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  commenter_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 10. Body Measurements Table
CREATE TABLE IF NOT EXISTS body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  measured_at date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric(5,2) CHECK (weight_kg > 0),
  body_fat_percentage numeric(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  chest_cm numeric(5,2),
  waist_cm numeric(5,2),
  hips_cm numeric(5,2),
  arms_cm numeric(5,2),
  legs_cm numeric(5,2),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_workouts_is_public ON workouts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_is_public ON exercises(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_date ON scheduled_workouts(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_completed ON workout_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_log ON exercise_logs(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON trainer_clients(trainer_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON trainer_clients(client_id) WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Trainers can view their clients profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = user_profiles.id
      AND trainer_clients.status = 'active'
    )
  );

-- RLS Policies for exercises
CREATE POLICY "Users can view public exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create own exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for workouts
CREATE POLICY "Users can view own and public workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR is_public = true);

CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view workout exercises for accessible workouts"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND (workouts.created_by = auth.uid() OR workouts.is_public = true)
    )
  );

CREATE POLICY "Users can manage workout exercises for own workouts"
  ON workout_exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.created_by = auth.uid()
    )
  );

-- RLS Policies for scheduled_workouts
CREATE POLICY "Users can view own scheduled workouts"
  ON scheduled_workouts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own scheduled workouts"
  ON scheduled_workouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scheduled workouts"
  ON scheduled_workouts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own scheduled workouts"
  ON scheduled_workouts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view client scheduled workouts"
  ON scheduled_workouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = scheduled_workouts.user_id
      AND trainer_clients.status = 'active'
    )
  );

CREATE POLICY "Trainers can assign workouts to clients"
  ON scheduled_workouts FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = scheduled_workouts.user_id
      AND trainer_clients.status = 'active'
    )
  );

-- RLS Policies for workout_logs
CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own workout logs"
  ON workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view client workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = workout_logs.user_id
      AND trainer_clients.status = 'active'
    )
  );

-- RLS Policies for exercise_logs
CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own exercise logs"
  ON exercise_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can view client exercise logs"
  ON exercise_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      JOIN trainer_clients ON trainer_clients.client_id = workout_logs.user_id
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.status = 'active'
    )
  );

-- RLS Policies for trainer_clients
CREATE POLICY "Trainers can view own relationships"
  ON trainer_clients FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Trainers can create relationships"
  ON trainer_clients FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own relationships"
  ON trainer_clients FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Users can update relationships as client"
  ON trainer_clients FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- RLS Policies for workout_comments
CREATE POLICY "Users can view comments on own workout logs"
  ON workout_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = workout_comments.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can view comments on client workout logs"
  ON workout_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      JOIN trainer_clients ON trainer_clients.client_id = workout_logs.user_id
      WHERE workout_logs.id = workout_comments.workout_log_id
      AND trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.status = 'active'
    )
  );

CREATE POLICY "Trainers can comment on client workout logs"
  ON workout_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    commenter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM workout_logs
      JOIN trainer_clients ON trainer_clients.client_id = workout_logs.user_id
      WHERE workout_logs.id = workout_comments.workout_log_id
      AND trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.status = 'active'
    )
  );

-- RLS Policies for body_measurements
CREATE POLICY "Users can view own body measurements"
  ON body_measurements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own body measurements"
  ON body_measurements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own body measurements"
  ON body_measurements FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own body measurements"
  ON body_measurements FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view client body measurements"
  ON body_measurements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = body_measurements.user_id
      AND trainer_clients.status = 'active'
    )
  );