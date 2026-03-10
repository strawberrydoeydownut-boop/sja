
import React, { useState, useEffect, useCallback } from 'react';
import { User, Appointment, Service, Dentist, AppointmentStatus, VirtualEmail } from '../../types';
import { getAppointmentsForUser, getServices, getDentists, cancelAppointment, getEmailsForAddress } from '../../services/mockApi';
import Header from '../Layout/Header';
import Booking from './Booking';
import { format, isSameDay, addDays } from 'date-fns';
import { CalendarIcon, ClockIcon, UserIcon } from '../Shared/Icons';
import Modal from '../Shared/Modal';
import { speakText } from '../../services/speechService';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [emails, setEmails] = useState<VirtualEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'appointments' | 'booking'>('appointments');
  const [showInbox, setShowInbox] = useState(false);

  const fetchPatientData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userAppointments, allServices, allDentists, userEmails] = await Promise.all([
        getAppointmentsForUser(user.id),
        getServices(),
        getDentists(),
        getEmailsForAddress(user.email)
      ]);
      setAppointments(userAppointments);
      setServices(allServices);
      setDentists(allDentists);
      setEmails(userEmails);
    } catch (error) {
      console.error("Failed to fetch patient data", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, user.email]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleBookingSuccess = () => {
    fetchPatientData(); 
    setView('appointments');
  };

  const handleSpeakAppointment = (app: Appointment) => {
    const dentist = dentists.find(d => d.id === app.dentistId);
    const service = services.find(s => s.id === app.serviceId);
    const timeStr = format(new Date(app.start), 'eeee, MMMM do at h:mm a');
    const text = `You have a ${service?.name} scheduled with ${dentist?.name} on ${timeStr}. Status: ${app.status}.`;
    speakText(text);
  };

  const handleSpeakEmail = (email: VirtualEmail) => {
    speakText(`Subject: ${email.subject}. Message: ${email.body}`);
  };

  const upcomingAppointments = appointments
    .filter(a => (a.status === AppointmentStatus.Scheduled || a.status === AppointmentStatus.Pending) && new Date(a.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'appointments' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowInbox(true)} 
                  className="relative p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
                  title="My Inbox"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {emails.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">{emails.length}</span>}
                </button>
                <button onClick={() => setView('booking')} className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-dark">
                    Book New
                </button>
              </div>
            </div>

            {isLoading ? (
              <p className="animate-pulse">Loading health records...</p>
            ) : (
              <div className="space-y-6">
                <section>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-brand-blue pl-3">Active Schedule</h3>
                    {upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingAppointments.map(app => {
                        const dentist = dentists.find(d => d.id === app.dentistId);
                        const service = services.find(s => s.id === app.serviceId);
                        const isPending = app.status === AppointmentStatus.Pending;

                        return (
                            <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <p className="font-bold text-brand-blue-dark text-lg">{service?.name}</p>
                                     <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded-full border ${isPending ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                         {isPending ? 'Approval Requested' : 'Confirmed'}
                                     </span>
                                 </div>
                                 <div className="flex gap-2">
                                     <button 
                                         onClick={() => handleSpeakAppointment(app)}
                                         className="p-2 bg-brand-blue-light text-brand-blue rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                                         title="Read Aloud"
                                     >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                                     </button>
                                     <button 
                                         onClick={async () => {
                                             if (window.confirm("Are you sure you want to cancel this appointment?")) {
                                                 await cancelAppointment(app.id);
                                                 fetchPatientData();
                                             }
                                         }}
                                         className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                         title="Cancel Appointment"
                                     >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                     </button>
                                 </div>
                            </div>
                            <div className="text-gray-600 space-y-2 text-sm">
                                <p className="flex items-center"><UserIcon className="w-4 h-4 mr-3 text-brand-blue"/> {dentist?.name}</p>
                                <p className="flex items-center"><CalendarIcon className="w-4 h-4 mr-3 text-brand-blue"/> {format(new Date(app.start), 'eeee, MMM d')}</p>
                                <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-3 text-brand-blue"/> {format(new Date(app.start), 'h:mm a')}</p>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No active schedules found.</p>
                    </div>
                    )}
                </section>
                
                <section>
                    <h3 className="text-lg font-semibold text-gray-400 mt-10 mb-4 uppercase tracking-widest text-[10px]">Visit History</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {appointments.filter(a => a.status === AppointmentStatus.Completed).map(app => (
                            <div key={app.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-80 flex flex-col">
                                <p className="font-bold text-gray-700 text-xs truncate">{services.find(s => s.id === app.serviceId)?.name}</p>
                                <p className="text-[10px] text-gray-500">{format(new Date(app.start), 'MMM d, yyyy')}</p>
                            </div>
                        ))}
                    </div>
                </section>
              </div>
            )}

            <Modal isOpen={showInbox} onClose={() => setShowInbox(false)} title="Inbox & Alerts">
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {emails.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 italic">No messages found.</p>
                    ) : (
                        emails.map(email => (
                            <div key={email.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl group">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] text-brand-blue-dark font-black uppercase tracking-widest">{format(new Date(email.timestamp), 'MMM d @ h:mm a')}</p>
                                    <button onClick={() => handleSpeakEmail(email)} className="opacity-0 group-hover:opacity-100 text-brand-blue transition-opacity" title="Read Message Aloud">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                                    </button>
                                </div>
                                <h4 className="font-bold text-gray-800 mb-1">{email.subject}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-brand-blue/20 pl-3">
                                    {email.body}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
          </>
        ) : (
          <Booking 
            user={user} 
            dentists={dentists}
            services={services}
            onBookingSuccess={handleBookingSuccess}
            onBack={() => setView('appointments')}
          />
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
