/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import StudentProfileScreen from './components/StudentProfileScreen';
import LessonDetailScreen from './components/LessonDetailScreen';
import LearningPathScreen from './components/LearningPathScreen';
import StudentsListScreen from './components/StudentsListScreen';
import LessonHistoryScreen from './components/LessonHistoryScreen';
import AdminScreen from './components/AdminScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { gasApi, isGAS } from './utils/apiBridge';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isNavInitialized, setIsNavInitialized] = useState(false);
  const { isLoading } = useAuth();

  useEffect(() => {
    gasApi.getLocation().then((location) => {
      if (location && location.parameters) {
        if (location.parameters.screen && location.parameters.screen.length > 0) {
          setCurrentScreen(location.parameters.screen[0]);
        }
        if (location.parameters.id && location.parameters.id.length > 0) {
          setSelectedStudentId(location.parameters.id[0]);
        }
      }
      setIsNavInitialized(true);
    });
  }, []);

  const handleNavigate = (screen: string, id?: string) => {
    setCurrentScreen(screen);
    if (id) {
      setSelectedStudentId(id);
    } else {
      setSelectedStudentId(null);
    }

    if (isGAS) {
      gasApi.pushHistory(id ? { screen, id } : { screen });
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', screen);
      if (id) url.searchParams.set('id', id);
      else url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (isLoading || !isNavInitialized) {
    return (
      <div className="min-h-screen bg-[#3A5A42] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans text-slate-800 relative overflow-hidden">
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'students' && <StudentsListScreen onNavigate={handleNavigate} />}
      {currentScreen === 'student' && <StudentProfileScreen onNavigate={handleNavigate} studentId={selectedStudentId} />}
      {currentScreen === 'learning-path' && <LearningPathScreen onNavigate={handleNavigate} />}
      {currentScreen === 'lesson' && <LessonDetailScreen onNavigate={handleNavigate} studentId={selectedStudentId} />}
      {currentScreen === 'lesson-history' && <LessonHistoryScreen onNavigate={handleNavigate} />}
      {currentScreen === 'admin' && <AdminScreen onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

