# FitTracker Pro

A comprehensive fitness workout planning and tracking platform built with React, TypeScript, and Supabase.

## Features

### Core Functionality (MVP)

1. **User Management**
   - Email/password authentication
   - User roles: USER, TRAINER, ADMIN
   - User profiles with fitness goals and experience levels

2. **Exercise Library**
   - 25+ pre-populated exercises
   - Exercises categorized by muscle groups, equipment type, and difficulty
   - Detailed exercise descriptions with video demonstrations
   - Filter and search functionality

3. **Workout Management**
   - Create custom workouts
   - Add exercises with sets, reps, weights, and rest periods
   - Save workouts as templates
   - Share workouts publicly
   - Duplicate and modify existing workouts

4. **Workout Calendar**
   - Weekly calendar view
   - Schedule workouts for specific dates
   - Mark workouts as completed
   - Quick workout assignment

5. **Progress Tracking**
   - View workout history
   - Track exercise performance over time
   - Visual progress charts for individual exercises
   - Statistics: total workouts, monthly activity, average RPE

6. **User Profile**
   - Manage personal information
   - Set fitness goals and experience level
   - Track body measurements

### Future Features

- Trainer-client relationships
- Social features (sharing, likes, comments)
- Body measurement tracking over time
- Advanced analytics and reports
- Mobile app integration
- Notifications and reminders

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The application uses a comprehensive database schema with the following main tables:

- `user_profiles` - Extended user information
- `exercises` - Exercise library
- `workouts` - Workout templates and plans
- `workout_exercises` - Exercises within workouts
- `scheduled_workouts` - Calendar of planned workouts
- `workout_logs` - Completed workout records
- `exercise_logs` - Individual exercise performance data
- `trainer_clients` - Trainer-client relationships
- `workout_comments` - Trainer feedback on workouts
- `body_measurements` - Body measurement tracking

All tables have Row Level Security (RLS) enabled to ensure data privacy and security.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`

4. Start the development server:
   ```bash
   npm run dev
   ```

### First Use

1. **Sign Up**: Create a new account with email and password
2. **Complete Profile**: Fill in your fitness information (age, goals, experience level)
3. **Explore Exercises**: Browse the exercise library to see available exercises
4. **Create Workout**: Build your first workout by selecting exercises
5. **Schedule**: Add your workout to the calendar
6. **Track Progress**: After completing workouts, view your progress charts

## User Roles

- **USER**: Can create personal workouts, schedule training, track progress
- **TRAINER**: Can create public workouts, manage clients (future feature)
- **ADMIN**: Full system access (future feature)

## Key Features Explained

### Workout Builder

The workout editor allows you to:
- Name and describe your workout
- Set workout type (strength, cardio, yoga, etc.)
- Add exercises from the library
- Configure sets, reps, weights, and rest periods for each exercise
- Save as a template for reuse

### Calendar View

- View your training schedule by week
- Click on any day to add a workout
- Mark workouts as completed with a single click
- See today's workouts at a glance

### Progress Tracking

- Automatically tracks all completed workouts
- View maximum weights used per exercise over time
- See total reps and volume statistics
- Visual charts show your improvement

## Security

- All data is protected with Row Level Security (RLS)
- Users can only access their own data
- Trainers can access their assigned clients' data (when feature is enabled)
- Password authentication via Supabase Auth

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## License

This project is part of a fitness platform prototype and is intended for educational and demonstration purposes.
