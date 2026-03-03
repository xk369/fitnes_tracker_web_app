import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { WorkoutEditor } from '../components/WorkoutEditor';

type Workout = Database['public']['Tables']['workouts']['Row'];

export function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('created_by', user!.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setWorkouts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (!error) {
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    }
  };

  const handleDuplicate = async (workout: Workout) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        created_by: user!.id,
        name: `${workout.name} (Copy)`,
        description: workout.description,
        workout_type: workout.workout_type,
        duration_minutes: workout.duration_minutes,
        difficulty_level: workout.difficulty_level,
        is_template: workout.is_template,
        is_public: false,
      })
      .select()
      .single();

    if (data && !error) {
      const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workout.id);

      if (exercises) {
        await supabase.from('workout_exercises').insert(
          exercises.map(ex => ({
            workout_id: data.id,
            exercise_id: ex.exercise_id,
            section: ex.section,
            order_index: ex.order_index,
            sets: ex.sets,
            reps: ex.reps,
            weight_kg: ex.weight_kg,
            duration_seconds: ex.duration_seconds,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
          }))
        );
      }

      fetchWorkouts();
    }
  };

  if (isCreating || editingWorkout) {
    return (
      <WorkoutEditor
        workout={editingWorkout}
        onSave={() => {
          setIsCreating(false);
          setEditingWorkout(null);
          fetchWorkouts();
        }}
        onCancel={() => {
          setIsCreating(false);
          setEditingWorkout(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Workouts</h1>
          <p className="text-gray-600">Create and manage your workout routines</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New Workout</span>
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts yet</h3>
          <p className="text-gray-600 mb-6">Create your first workout to get started</p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create Workout</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{workout.name}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDuplicate(workout)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingWorkout(workout)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {workout.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{workout.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{workout.workout_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{workout.duration_minutes} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workout.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                    workout.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {workout.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-2">
                {workout.is_template && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Template
                  </span>
                )}
                {workout.is_public && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Public
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
