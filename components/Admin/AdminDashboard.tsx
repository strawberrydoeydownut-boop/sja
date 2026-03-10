
import React, { useState, useEffect } from 'react';
import { User, Appointment, AppointmentStatus } from '../../types';
import Header from '../Layout/Header';
import FullCalendar from './FullCalendar';
import Reports from './Reports';
import Settings from './Settings';
import DentistManagement from './DentistManagement';
import { getAllAppointments } from '../../services/mockApi';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'calendar' | 'dentists' | 'reports' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('calendar');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPending = async () => {
      const all = await getAllAppointments();
      // If the user is a dentist, only count their pending
      const count = all.filter(a => 
        a.status === AppointmentStatus.Pending && 
        (user.id.includes('admin') || a.dentistId === user.id)
      ).length;
      setPendingCount(count);
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const navLinkClass = (view: AdminView) => 
    `${activeView === view 
        ? 'border-brand-blue text-brand-blue-dark' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center relative`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                <button onClick={() => setActiveView('calendar')} className={navLinkClass('calendar')}>
                Calendar
                {pendingCount > 0 && activeView !== 'calendar' && (
                    <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {pendingCount}
                    </span>
                )}
                </button>
                <button onClick={() => setActiveView('dentists')} className={navLinkClass('dentists')}>Dentists</button>
                <button onClick={() => setActiveView('reports')} className={navLinkClass('reports')}>Reports</button>
                <button onClick={() => setActiveView('settings')} className={navLinkClass('settings')}>Settings</button>
            </nav>
          </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
                {activeView === 'calendar' && <FullCalendar currentUser={user} />}
                {activeView === 'dentists' && <DentistManagement />}
                {activeView === 'reports' && <Reports />}
                {activeView === 'settings' && <Settings />}
            </div>

            {/* Notification Sidebar */}
            <div className="hidden lg:block space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Alerts Center
                    </h3>
                    {pendingCount > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">You have <span className="font-bold text-amber-600">{pendingCount}</span> new appointment requests waiting for your approval.</p>
                            <button 
                                onClick={() => setActiveView('calendar')}
                                className="w-full py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-md hover:bg-amber-100 transition-colors border border-amber-200"
                            >
                                Review Requests Now
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-400 italic">No pending actions at this time.</p>
                        </div>
                    )}
                </div>

                <div className="bg-brand-blue-dark text-white p-6 rounded-lg shadow-lg">
                    <h4 className="font-bold mb-2">NexSched Admin</h4>
                    <p className="text-xs opacity-80 leading-relaxed">
                        Welcome, {user.name.split(' ').pop()}. All changes made here are instantly synced to patient portals and public booking pages.
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
