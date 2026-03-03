import { useEffect, useState } from 'react';
import { Search, Filter, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Exercise = Database['public']['Tables']['exercises']['Row'];

export function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedEquipment, selectedDifficulty, selectedMuscleGroup]);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (data && !error) {
      setExercises(data);
    }
    setLoading(false);
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedEquipment !== 'all') {
      filtered = filtered.filter((ex) => ex.equipment_type === selectedEquipment);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((ex) => ex.difficulty_level === selectedDifficulty);
    }

    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter((ex) =>
        ex.muscle_groups.some(mg => mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase()))
      );
    }

    setFilteredExercises(filtered);
  };

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'core'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h1>
        <p className="text-gray-600">Browse our comprehensive collection of exercises</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Equipment</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="barbell">Barbell</option>
            <option value="machine">Machine</option>
            <option value="cable">Cable</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Muscle Groups</option>
            {muscleGroups.map((mg) => (
              <option key={mg} value={mg}>{mg.charAt(0).toUpperCase() + mg.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredExercises.length} of {exercises.length} exercises
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
                {exercise.video_url && (
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Play className="w-5 h-5 text-blue-600" />
                  </a>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.slice(0, 3).map((mg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                    >
                      {mg}
                    </span>
                  ))}
                  {exercise.muscle_groups.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      +{exercise.muscle_groups.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{exercise.equipment_type}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    exercise.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                    exercise.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {exercise.difficulty_level}
                  </span>
                </div>

                <div className="text-xs text-gray-500 capitalize">
                  {exercise.exercise_type} exercise
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No exercises found matching your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedEquipment('all');
              setSelectedDifficulty('all');
              setSelectedMuscleGroup('all');
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
