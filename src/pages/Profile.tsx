import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { FitnessGoal, FitnessLevel } from '../lib/database.types';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    fitness_goal: profile?.fitness_goal || 'maintenance',
    fitness_level: profile?.fitness_level || 'beginner',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const updates = {
      full_name: formData.full_name,
      age: formData.age ? parseInt(formData.age as string) : null,
      gender: formData.gender || null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm as string) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg as string) : null,
      fitness_goal: formData.fitness_goal as FitnessGoal,
      fitness_level: formData.fitness_level as FitnessLevel,
    };

    const { error } = await updateProfile(updates);
    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      setEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      age: profile?.age || '',
      gender: profile?.gender || '',
      height_cm: profile?.height_cm || '',
      weight_kg: profile?.weight_kg || '',
      fitness_goal: profile?.fitness_goal || 'maintenance',
      fitness_level: profile?.fitness_level || 'beginner',
    });
    setEditing(false);
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your personal information and fitness preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-gray-600 capitalize">{profile?.role}</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm ${message.includes('Error') ? 'text-red-700' : 'text-green-700'}`}>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
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
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
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
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
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
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
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
                  onClick={() => editing && setFormData({ ...formData, fitness_goal: goal.value })}
                  disabled={!editing}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.fitness_goal === goal.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!editing && 'opacity-60 cursor-not-allowed'}`}
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
                  onClick={() => editing && setFormData({ ...formData, fitness_level: level.value })}
                  disabled={!editing}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.fitness_level === level.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!editing && 'opacity-60 cursor-not-allowed'}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
