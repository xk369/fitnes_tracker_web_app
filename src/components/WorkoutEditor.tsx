import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'] & {
  exercises: Database['public']['Tables']['exercises']['Row'];
};
type Exercise = Database['public']['Tables']['exercises']['Row'];

interface WorkoutEditorProps {
  workout: Workout | null;
  onSave: () => void;
  onCancel: () => void;
}

export function WorkoutEditor({ workout, onSave, onCancel }: WorkoutEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState({
    name: workout?.name || '',
    description: workout?.description || '',
    workout_type: workout?.workout_type || 'strength',
    duration_minutes: workout?.duration_minutes || 60,
    difficulty_level: workout?.difficulty_level || 'beginner',
    is_template: workout?.is_template || false,
    is_public: workout?.is_public || false,
  });
  const [workoutExercises, setWorkoutExercises] = useState<Array<{
    exercise_id: string;
    section: string;
    order_index: number;
    sets: number;
    reps: number | null;
    weight_kg: number | null;
    duration_seconds: number | null;
    rest_seconds: number;
    notes: string;
    exercise?: Exercise;
  }>>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    fetchAvailableExercises();
    if (workout) {
      fetchWorkoutExercises();
    }
  }, [workout]);

  const fetchAvailableExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    if (data) setAvailableExercises(data);
  };

  const fetchWorkoutExercises = async () => {
    if (!workout) return;
    const { data } = await supabase
      .from('workout_exercises')
      .select('*, exercises(*)')
      .eq('workout_id', workout.id)
      .order('order_index');

    if (data) {
      setWorkoutExercises(data.map(we => ({
        exercise_id: we.exercise_id,
        section: we.section,
        order_index: we.order_index,
        sets: we.sets,
        reps: we.reps,
        weight_kg: we.weight_kg,
        duration_seconds: we.duration_seconds,
        rest_seconds: we.rest_seconds,
        notes: we.notes,
        exercise: (we as WorkoutExercise).exercises,
      })));
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise_id: exercise.id,
        section: 'main',
        order_index: workoutExercises.length,
        sets: 3,
        reps: 10,
        weight_kg: null,
        duration_seconds: null,
        rest_seconds: 60,
        notes: '',
        exercise,
      },
    ]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = workoutExercises.filter((_, i) => i !== index);
    setWorkoutExercises(updated.map((ex, i) => ({ ...ex, order_index: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (workout) {
        const { error } = await supabase
          .from('workouts')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', workout.id);

        if (error) throw error;

        await supabase.from('workout_exercises').delete().eq('workout_id', workout.id);

        if (workoutExercises.length > 0) {
          await supabase.from('workout_exercises').insert(
            workoutExercises.map(({ exercise, ...ex }) => ({
              ...ex,
              workout_id: workout.id,
            }))
          );
        }
      } else {
        const { data: newWorkout, error } = await supabase
          .from('workouts')
          .insert({ ...formData, created_by: user!.id })
          .select()
          .single();

        if (error || !newWorkout) throw error;

        if (workoutExercises.length > 0) {
          await supabase.from('workout_exercises').insert(
            workoutExercises.map(({ exercise, ...ex }) => ({
              ...ex,
              workout_id: newWorkout.id,
            }))
          );
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {workout ? 'Edit Workout' : 'Create New Workout'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Type *
              </label>
              <select
                value={formData.workout_type}
                onChange={(e) => setFormData({ ...formData, workout_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="crossfit">CrossFit</option>
                <option value="hiit">HIIT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_template}
                onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Save as template</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Make public (visible to others)</span>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Exercises</h3>
              <button
                type="button"
                onClick={() => setShowExercisePicker(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exercise</span>
              </button>
            </div>

            {workoutExercises.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">No exercises added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutExercises.map((we, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{we.exercise?.name}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <input
                            type="number"
                            placeholder="Sets"
                            value={we.sets}
                            onChange={(e) => {
                              const updated = [...workoutExercises];
                              updated[index].sets = parseInt(e.target.value) || 0;
                              setWorkoutExercises(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={we.reps || ''}
                            onChange={(e) => {
                              const updated = [...workoutExercises];
                              updated[index].reps = parseInt(e.target.value) || null;
                              setWorkoutExercises(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={we.weight_kg || ''}
                            onChange={(e) => {
                              const updated = [...workoutExercises];
                              updated[index].weight_kg = parseFloat(e.target.value) || null;
                              setWorkoutExercises(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                            step="0.5"
                          />
                          <input
                            type="number"
                            placeholder="Rest (sec)"
                            value={we.rest_seconds}
                            onChange={(e) => {
                              const updated = [...workoutExercises];
                              updated[index].rest_seconds = parseInt(e.target.value) || 0;
                              setWorkoutExercises(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>

      {showExercisePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Select Exercise</h3>
              <button onClick={() => setShowExercisePicker(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                {availableExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleAddExercise(exercise)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{exercise.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {exercise.equipment_type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {exercise.difficulty_level}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
