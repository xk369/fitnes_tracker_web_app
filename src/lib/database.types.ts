export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'USER' | 'TRAINER' | 'ADMIN';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'flexibility';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'flexibility' | 'sports' | 'crossfit' | 'hiit';
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';
export type EquipmentType = 'bodyweight' | 'dumbbells' | 'barbell' | 'machine' | 'cable' | 'kettlebell' | 'resistance_band' | 'other';
export type ExerciseType = 'compound' | 'isolation';
export type WorkoutSection = 'warmup' | 'main' | 'cooldown';
export type TrainerClientStatus = 'pending' | 'active' | 'inactive';
export type FeelingType = 'great' | 'good' | 'okay' | 'tired' | 'exhausted';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          age: number | null;
          gender: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          fitness_goal: FitnessGoal;
          fitness_level: FitnessLevel;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          age?: number | null;
          gender?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          fitness_goal?: FitnessGoal;
          fitness_level?: FitnessLevel;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          age?: number | null;
          gender?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          fitness_goal?: FitnessGoal;
          fitness_level?: FitnessLevel;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          description: string;
          video_url: string | null;
          muscle_groups: string[];
          equipment_type: EquipmentType;
          difficulty_level: FitnessLevel;
          exercise_type: ExerciseType;
          created_by: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          video_url?: string | null;
          muscle_groups?: string[];
          equipment_type?: EquipmentType;
          difficulty_level?: FitnessLevel;
          exercise_type?: ExerciseType;
          created_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          video_url?: string | null;
          muscle_groups?: string[];
          equipment_type?: EquipmentType;
          difficulty_level?: FitnessLevel;
          exercise_type?: ExerciseType;
          created_by?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          description: string;
          workout_type: WorkoutType;
          duration_minutes: number;
          difficulty_level: FitnessLevel;
          is_template: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          description?: string;
          workout_type?: WorkoutType;
          duration_minutes?: number;
          difficulty_level?: FitnessLevel;
          is_template?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          name?: string;
          description?: string;
          workout_type?: WorkoutType;
          duration_minutes?: number;
          difficulty_level?: FitnessLevel;
          is_template?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          section: WorkoutSection;
          order_index: number;
          sets: number;
          reps: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          rest_seconds: number;
          notes: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          section?: WorkoutSection;
          order_index?: number;
          sets?: number;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number;
          notes?: string;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string;
          section?: WorkoutSection;
          order_index?: number;
          sets?: number;
          reps?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rest_seconds?: number;
          notes?: string;
        };
      };
      scheduled_workouts: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          scheduled_date: string;
          scheduled_time: string | null;
          status: WorkoutStatus;
          assigned_by: string | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          scheduled_date: string;
          scheduled_time?: string | null;
          status?: WorkoutStatus;
          assigned_by?: string | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_id?: string;
          scheduled_date?: string;
          scheduled_time?: string | null;
          status?: WorkoutStatus;
          assigned_by?: string | null;
          notes?: string;
          created_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          scheduled_workout_id: string | null;
          completed_at: string;
          duration_minutes: number | null;
          overall_rpe: number | null;
          notes: string;
          feeling: FeelingType | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          scheduled_workout_id?: string | null;
          completed_at?: string;
          duration_minutes?: number | null;
          overall_rpe?: number | null;
          notes?: string;
          feeling?: FeelingType | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_id?: string;
          scheduled_workout_id?: string | null;
          completed_at?: string;
          duration_minutes?: number | null;
          overall_rpe?: number | null;
          notes?: string;
          feeling?: FeelingType | null;
          created_at?: string;
        };
      };
      exercise_logs: {
        Row: {
          id: string;
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps_completed: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          rpe: number | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps_completed?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rpe?: number | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_log_id?: string;
          exercise_id?: string;
          set_number?: number;
          reps_completed?: number | null;
          weight_kg?: number | null;
          duration_seconds?: number | null;
          rpe?: number | null;
          notes?: string;
          created_at?: string;
        };
      };
      trainer_clients: {
        Row: {
          id: string;
          trainer_id: string;
          client_id: string;
          status: TrainerClientStatus;
          started_at: string | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          client_id: string;
          status?: TrainerClientStatus;
          started_at?: string | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          client_id?: string;
          status?: TrainerClientStatus;
          started_at?: string | null;
          notes?: string;
          created_at?: string;
        };
      };
      workout_comments: {
        Row: {
          id: string;
          workout_log_id: string;
          commenter_id: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          commenter_id: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_log_id?: string;
          commenter_id?: string;
          comment?: string;
          created_at?: string;
        };
      };
      body_measurements: {
        Row: {
          id: string;
          user_id: string;
          measured_at: string;
          weight_kg: number | null;
          body_fat_percentage: number | null;
          chest_cm: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          arms_cm: number | null;
          legs_cm: number | null;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          measured_at?: string;
          weight_kg?: number | null;
          body_fat_percentage?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          arms_cm?: number | null;
          legs_cm?: number | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          measured_at?: string;
          weight_kg?: number | null;
          body_fat_percentage?: number | null;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          arms_cm?: number | null;
          legs_cm?: number | null;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
