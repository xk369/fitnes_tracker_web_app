import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ScheduledWorkout = Database['public']['Tables']['scheduled_workouts']['Row'] & {
  workouts: Database['public']['Tables']['workouts']['Row'];
};
type Workout = Database['public']['Tables']['workouts']['Row'];

export function WorkoutCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const [scheduledResult, workoutsResult] = await Promise.all([
      supabase
        .from('scheduled_workouts')
        .select('*, workouts(*)')
        .eq('user_id', user!.id)
        .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
        .lte('scheduled_date', endOfWeek.toISOString().split('T')[0]),
      supabase
        .from('workouts')
        .select('*')
        .eq('created_by', user!.id)
        .order('name'),
    ]);

    if (scheduledResult.data) setScheduledWorkouts(scheduledResult.data as ScheduledWorkout[]);
    if (workoutsResult.data) setMyWorkouts(workoutsResult.data);
    setLoading(false);
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledWorkouts.filter(sw => sw.scheduled_date === dateStr);
  };

  const handleAddWorkout = async (workoutId: string) => {
    if (!selectedDate) return;

    const { error } = await supabase.from('scheduled_workouts').insert({
      user_id: user!.id,
      workout_id: workoutId,
      scheduled_date: selectedDate.toISOString().split('T')[0],
      status: 'planned',
    });

    if (!error) {
      setShowAddWorkout(false);
      setSelectedDate(null);
      fetchData();
    }
  };

  const handleStatusChange = async (scheduledId: string, newStatus: string) => {
    const { error } = await supabase
      .from('scheduled_workouts')
      .update({ status: newStatus })
      .eq('id', scheduledId);

    if (!error) fetchData();
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Workout Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const dayWorkouts = getWorkoutsForDate(date);

            return (
              <div
                key={dateStr}
                className={`bg-white rounded-xl border-2 ${
                  isToday ? 'border-blue-500' : 'border-gray-200'
                } p-4 min-h-[200px]`}
              >
                <div className="mb-3">
                  <div className="text-sm text-gray-600 font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayWorkouts.map((sw) => (
                    <div
                      key={sw.id}
                      className="p-2 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {sw.workouts.name}
                          </p>
                          {sw.scheduled_time && (
                            <p className="text-xs text-gray-600">{sw.scheduled_time}</p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              sw.id,
                              sw.status === 'completed' ? 'planned' : 'completed'
                            )
                          }
                          className="ml-2"
                        >
                          {sw.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedDate(date);
                    setShowAddWorkout(true);
                  }}
                  className="mt-3 w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-600 hover:text-blue-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAddWorkout && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Schedule Workout for {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => {
                  setShowAddWorkout(false);
                  setSelectedDate(null);
                }}
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {myWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No workouts available</p>
                  <p className="text-sm text-gray-500">Create a workout first to schedule it</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => handleAddWorkout(workout.id)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">{workout.name}</h4>
                      {workout.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {workout.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                          {workout.workout_type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {workout.duration_minutes} min
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
