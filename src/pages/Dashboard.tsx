import { useEffect, useState } from 'react';
import { Calendar, Dumbbell, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ScheduledWorkout = Database['public']['Tables']['scheduled_workouts']['Row'] & {
  workouts: Database['public']['Tables']['workouts']['Row'];
};

type WorkoutLog = Database['public']['Tables']['workout_logs']['Row'];

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { profile } = useAuth();
  const [todayWorkouts, setTodayWorkouts] = useState<ScheduledWorkout[]>([]);
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [scheduledResult, logsResult, weekLogsResult] = await Promise.all([
      supabase
        .from('scheduled_workouts')
        .select('*, workouts(*)')
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true }),
      supabase
        .from('workout_logs')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase
        .from('workout_logs')
        .select('id')
        .gte('completed_at', weekAgo),
    ]);

    if (scheduledResult.data) setTodayWorkouts(scheduledResult.data as ScheduledWorkout[]);
    if (logsResult.data) setRecentLogs(logsResult.data);
    if (weekLogsResult.data) {
      setStats((prev) => ({
        ...prev,
        totalWorkouts: recentLogs.length,
        thisWeekWorkouts: weekLogsResult.data.length,
      }));
    }

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { label: 'Start Workout', icon: Dumbbell, page: 'workouts', color: 'blue' },
    { label: 'View Calendar', icon: Calendar, page: 'calendar', color: 'green' },
    { label: 'Track Progress', icon: TrendingUp, page: 'progress', color: 'orange' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-blue-100">Ready to crush your fitness goals today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Total Workouts</h3>
            <Dumbbell className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalWorkouts}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">This Week</h3>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.thisWeekWorkouts}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Current Streak</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className={`bg-white rounded-xl p-6 border-2 border-${action.color}-200 hover:border-${action.color}-400 hover:shadow-lg transition-all group`}
            >
              <Icon className={`w-8 h-8 text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`} />
              <p className="font-semibold text-gray-900">{action.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Workouts</h2>
          {todayWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No workouts scheduled for today</p>
              <button
                onClick={() => onNavigate('calendar')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Schedule a workout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayWorkouts.map((scheduled) => (
                <div
                  key={scheduled.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      scheduled.status === 'completed' ? 'bg-green-500' :
                      scheduled.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-900">{scheduled.workouts.name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {scheduled.scheduled_time || 'Anytime'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    scheduled.status === 'completed' ? 'bg-green-100 text-green-700' :
                    scheduled.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {scheduled.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No workout history yet</p>
              <button
                onClick={() => onNavigate('workouts')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Start your first workout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const date = new Date(log.completed_at);
                return (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Workout Completed</p>
                        <p className="text-sm text-gray-600">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {log.overall_rpe && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">RPE</p>
                          <p className="text-lg font-bold text-gray-900">{log.overall_rpe}/10</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
