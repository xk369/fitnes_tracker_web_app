import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { ProfileSetup } from './components/ProfileSetup';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Exercises } from './pages/Exercises';
import { Workouts } from './pages/Workouts';
import { WorkoutCalendar } from './pages/WorkoutCalendar';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const needsProfileSetup = !profile?.age && !profileSetupComplete;
  if (needsProfileSetup) {
    return <ProfileSetup onComplete={() => setProfileSetupComplete(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'exercises':
        return <Exercises />;
      case 'workouts':
        return <Workouts />;
      case 'calendar':
        return <WorkoutCalendar />;
      case 'progress':
        return <Progress />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
