
import React, { useState, useCallback, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginPage from './components/Auth/LoginPage';
import PatientDashboard from './components/Patient/PatientDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import PublicBooking from './components/Public/PublicBooking';
import AccessibilityToolbar from './components/Shared/AccessibilityToolbar';
import { getCurrentUserAsync, logout } from './services/mockApi';

const App: React.FC = () => {
  const isPublicBooking = window.location.pathname.startsWith('/book');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const user = await getCurrentUserAsync();
      setCurrentUser(user);
      setIsInitializing(false);
    };
    initUser();
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setCurrentUser(null);
  }, []);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-gray-light">
      <div className="animate-pulse text-brand-blue font-bold">Initializing NexSched...</div>
    </div>;
  }

  if (isPublicBooking) {
    return (
        <div className="bg-brand-gray-light min-h-screen font-sans text-gray-800">
            <PublicBooking />
            <AccessibilityToolbar />
        </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    switch (currentUser.role) {
      case UserRole.Patient:
        return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.Admin:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-brand-gray-light min-h-screen font-sans text-gray-800">
      {renderContent()}
      <AccessibilityToolbar />
    </div>
  );
};

export default App;
