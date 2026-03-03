import { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Dumbbell, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type WorkoutLog = Database['public']['Tables']['workout_logs']['Row'] & {
  workouts: Database['public']['Tables']['workouts']['Row'];
};
type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row'] & {
  exercises: Database['public']['Tables']['exercises']['Row'];
};

interface ExerciseProgress {
  exercise_id: string;
  exercise_name: string;
  logs: Array<{
    date: string;
    max_weight: number;
    total_reps: number;
  }>;
}

export function Progress() {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisMonthWorkouts: 0,
    totalVolume: 0,
    avgRPE: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [logsResult, exerciseLogsResult] = await Promise.all([
      supabase
        .from('workout_logs')
        .select('*, workouts(*)')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(30),
      supabase
        .from('exercise_logs')
        .select('*, exercises(*), workout_logs!inner(user_id, completed_at)')
        .eq('workout_logs.user_id', user!.id)
        .order('workout_logs.completed_at', { ascending: false })
        .limit(200),
    ]);

    if (logsResult.data) {
      setWorkoutLogs(logsResult.data as WorkoutLog[]);

      const thisMonthCount = logsResult.data.filter(
        log => new Date(log.completed_at) > monthAgo
      ).length;

      const avgRPE = logsResult.data
        .filter(log => log.overall_rpe)
        .reduce((sum, log) => sum + (log.overall_rpe || 0), 0) /
        (logsResult.data.filter(log => log.overall_rpe).length || 1);

      setStats({
        totalWorkouts: logsResult.data.length,
        thisMonthWorkouts: thisMonthCount,
        totalVolume: 0,
        avgRPE: Math.round(avgRPE * 10) / 10,
      });
    }

    if (exerciseLogsResult.data) {
      const exerciseMap = new Map<string, ExerciseProgress>();

      (exerciseLogsResult.data as any[]).forEach((log: any) => {
        const exerciseId = log.exercise_id;
        const exerciseName = log.exercises.name;
        const date = log.workout_logs.completed_at.split('T')[0];

        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, {
            exercise_id: exerciseId,
            exercise_name: exerciseName,
            logs: [],
          });
        }

        const existing = exerciseMap.get(exerciseId)!.logs.find(l => l.date === date);
        if (existing) {
          if (log.weight_kg && log.weight_kg > existing.max_weight) {
            existing.max_weight = log.weight_kg;
          }
          existing.total_reps += log.reps_completed || 0;
        } else {
          exerciseMap.get(exerciseId)!.logs.push({
            date,
            max_weight: log.weight_kg || 0,
            total_reps: log.reps_completed || 0,
          });
        }
      });

      const progressArray = Array.from(exerciseMap.values())
        .filter(ep => ep.logs.length > 1)
        .sort((a, b) => b.logs.length - a.logs.length);

      setExerciseProgress(progressArray);
      if (progressArray.length > 0 && !selectedExercise) {
        setSelectedExercise(progressArray[0].exercise_id);
      }
    }

    setLoading(false);
  };

  const selectedProgress = exerciseProgress.find(ep => ep.exercise_id === selectedExercise);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">Track your fitness journey and improvements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Total Workouts</h3>
            <Dumbbell className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalWorkouts}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">This Month</h3>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.thisMonthWorkouts}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Avg RPE</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.avgRPE}/10</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Exercises Tracked</h3>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{exerciseProgress.length}</p>
        </div>
      </div>

      {exerciseProgress.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Exercises</h2>
            <div className="space-y-2">
              {exerciseProgress.map((ep) => (
                <button
                  key={ep.exercise_id}
                  onClick={() => setSelectedExercise(ep.exercise_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedExercise === ep.exercise_id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{ep.exercise_name}</div>
                  <div className="text-sm text-gray-600">{ep.logs.length} sessions</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedProgress?.exercise_name} Progress
            </h2>
            {selectedProgress && (
              <div className="space-y-6">
                <div className="relative h-64 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-end justify-between h-full">
                    {selectedProgress.logs.slice(-10).map((log, index) => {
                      const maxWeight = Math.max(...selectedProgress.logs.map(l => l.max_weight));
                      const height = maxWeight > 0 ? (log.max_weight / maxWeight) * 100 : 20;

                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-semibold text-gray-900 mb-2">
                            {log.max_weight}kg
                          </div>
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                            style={{ height: `${height}%`, minHeight: '20px' }}
                          />
                          <div className="text-xs text-gray-600 mt-2 rotate-45 origin-left">
                            {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
                  {selectedProgress.logs.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          {log.max_weight}kg
                        </span>
                        <span className="text-sm text-gray-600">
                          {log.total_reps} reps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No progress data yet</h3>
          <p className="text-gray-600 mb-6">
            Complete workouts and log your exercises to see your progress
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Workouts</h2>
        {workoutLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No workouts logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutLogs.slice(0, 10).map((log) => {
              const date = new Date(log.completed_at);
              return (
                <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{log.workouts.name}</p>
                      <p className="text-sm text-gray-600">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {log.duration_minutes && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{log.duration_minutes} min</p>
                        </div>
                      )}
                      {log.overall_rpe && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">RPE</p>
                          <p className="font-semibold text-gray-900">{log.overall_rpe}/10</p>
                        </div>
                      )}
                      {log.feeling && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.feeling === 'great' ? 'bg-green-100 text-green-700' :
                          log.feeling === 'good' ? 'bg-blue-100 text-blue-700' :
                          log.feeling === 'okay' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.feeling}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
