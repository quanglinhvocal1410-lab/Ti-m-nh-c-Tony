/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import HomeScreen from './components/HomeScreen';
import StudentProfileScreen from './components/StudentProfileScreen';
import LessonDetailScreen from './components/LessonDetailScreen';
import LearningPathScreen from './components/LearningPathScreen';
import StudentsListScreen from './components/StudentsListScreen';
import LoginScreen from './components/LoginScreen';
import LessonHistoryScreen from './components/LessonHistoryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (screen: string, id?: string) => {
    setCurrentScreen(screen);
    if (id) {
      setSelectedStudentId(id);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#3A5A42] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="w-full min-h-screen font-sans text-slate-800 relative overflow-hidden">
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'students' && <StudentsListScreen onNavigate={handleNavigate} />}
      {currentScreen === 'student' && <StudentProfileScreen onNavigate={handleNavigate} studentId={selectedStudentId} />}
      {currentScreen === 'learning-path' && <LearningPathScreen onNavigate={handleNavigate} />}
      {currentScreen === 'lesson' && <LessonDetailScreen onNavigate={handleNavigate} studentId={selectedStudentId} />}
      {currentScreen === 'lesson-history' && <LessonHistoryScreen onNavigate={handleNavigate} />}
    </div>
  );
}

