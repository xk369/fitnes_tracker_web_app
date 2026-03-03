import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { FitnessGoal, FitnessLevel } from '../lib/database.types';

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    age: profile?.age || '',
    gender: profile?.gender || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    fitness_goal: profile?.fitness_goal || 'maintenance',
    fitness_level: profile?.fitness_level || 'beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const updates = {
      age: formData.age ? parseInt(formData.age as string) : null,
      gender: formData.gender || null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm as string) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg as string) : null,
      fitness_goal: formData.fitness_goal as FitnessGoal,
      fitness_level: formData.fitness_level as FitnessLevel,
    };

    const { error } = await updateProfile(updates);
    if (error) {
      setError(error.message);
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">Help us personalize your fitness experience</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25"
                min="13"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="175"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="70"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Goal
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'weight_loss', label: 'Weight Loss' },
                { value: 'muscle_gain', label: 'Muscle Gain' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'endurance', label: 'Endurance' },
                { value: 'flexibility', label: 'Flexibility' },
              ].map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, fitness_goal: goal.value })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.fitness_goal === goal.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, fitness_level: level.value })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.fitness_level === level.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
