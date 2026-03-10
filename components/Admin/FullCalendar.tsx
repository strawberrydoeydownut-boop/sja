
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, AppointmentStatus, Dentist, Service, User } from '../../types';
import { getAllAppointments, getDentists, getServices, getAllPatients, updateAppointmentStatus, approveAppointment } from '../../services/mockApi';
import { format, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, isSameDay, startOfMonth } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, UserIcon, ClockIcon } from '../Shared/Icons';
import Modal from '../Shared/Modal';

const statusColors: { [key in AppointmentStatus]: { bg: string, text: string } } = {
  [AppointmentStatus.Pending]: { bg: 'bg-amber-100', text: 'text-amber-700' },
  [AppointmentStatus.Scheduled]: { bg: 'bg-sky-100', text: 'text-sky-700' },
  [AppointmentStatus.Completed]: { bg: 'bg-green-100', text: 'text-green-700' },
  [AppointmentStatus.Cancelled]: { bg: 'bg-gray-100', text: 'text-gray-700' },
  [AppointmentStatus.NoShow]: { bg: 'bg-red-100', text: 'text-red-700' },
};

interface FullCalendarProps {
    currentUser: User;
}

const FullCalendar: React.FC<FullCalendarProps> = ({ currentUser }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [patients, setPatients] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [filterMyOnly, setFilterMyOnly] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [apptData, dentistData, serviceData, patientData] = await Promise.all([
                getAllAppointments(),
                getDentists(),
                getServices(),
                getAllPatients()
            ]);
            setAppointments(apptData);
            setDentists(dentistData);
            setServices(serviceData);
            setPatients(patientData);
        } catch (error) {
            console.error("Failed to load calendar data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAppointments = useMemo(() => {
        if (!filterMyOnly) return appointments;
        return appointments.filter(a => a.dentistId === currentUser.id);
    }, [appointments, filterMyOnly, currentUser.id]);

    const firstDayOfMonth = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
    const lastDayOfMonth = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
    const daysInMonth = useMemo(() => eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth }), [firstDayOfMonth, lastDayOfMonth]);
    const startingDayIndex = getDay(firstDayOfMonth);

    const handleApprove = async () => {
        if (!selectedAppointment) return;
        setIsUpdating(true);
        try {
            await approveAppointment(selectedAppointment.id);
            setSelectedAppointment(null);
            fetchData();
        } catch (error) {
            alert("Failed to approve appointment.");
        } finally {
            setIsUpdating(false);
        }
    }

    const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
        if (!selectedAppointment) return;
        setIsUpdating(true);
        await updateAppointmentStatus(selectedAppointment.id, newStatus);
        setSelectedAppointment(null);
        setIsUpdating(false);
        fetchData(); 
    };

    const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown Patient';
    const getDentistName = (id: string) => dentists.find(d => d.id === id)?.name || 'Unknown Dentist';
    const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Unknown Service';

    const isDentistAccount = currentUser.id.startsWith('dentist');

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Clinic Calendar</h2>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-amber-600 font-bold flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-1 animate-pulse"></span>
                            {appointments.filter(a => a.status === AppointmentStatus.Pending).length} Action Required
                        </p>
                        {isDentistAccount && (
                            <label className="flex items-center text-xs font-semibold text-brand-blue-dark cursor-pointer bg-brand-blue-light px-2 py-1 rounded">
                                <input 
                                    type="checkbox" 
                                    className="mr-2" 
                                    checked={filterMyOnly} 
                                    onChange={() => setFilterMyOnly(!filterMyOnly)} 
                                />
                                Show Only My Patients
                            </label>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-4 bg-gray-50 p-1 rounded-full border">
                     <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 rounded-full hover:bg-white hover:shadow-sm"><ChevronLeftIcon className="w-5 h-5" /></button>
                     <span className="text-sm font-bold w-32 text-center text-gray-700">{format(currentMonth, 'MMMM yyyy')}</span>
                     <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-white hover:shadow-sm"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {isLoading ? <p className="text-center py-20 text-gray-400 animate-pulse">Synchronizing Clinic Data...</p> : (
                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-gray-50 py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                    
                    {Array.from({ length: startingDayIndex }).map((_, i) => (
                         <div key={`empty-${i}`} className="bg-white h-24 md:h-32 lg:h-40" />
                    ))}

                    {daysInMonth.map(day => {
                        const dayAppointments = filteredAppointments.filter(a => isSameDay(new Date(a.start), day));
                        dayAppointments.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                        return (
                            <div key={day.toString()} className={`bg-white h-24 md:h-32 lg:h-40 p-1 md:p-2 border-t border-r border-gray-100 flex flex-col ${isToday(day) ? 'bg-blue-50/30' : ''}`}>
                                <span className={`text-xs font-bold mb-1 ${isToday(day) ? 'text-brand-blue ring-1 ring-brand-blue/30 px-1 rounded inline-block w-fit' : 'text-gray-400'}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                    {dayAppointments.map(appt => {
                                        const dentist = dentists.find(d => d.id === appt.dentistId);
                                        const color = dentist?.color || '#3182CE'; 
                                        const isPending = appt.status === AppointmentStatus.Pending;
                                        
                                        return (
                                            <button
                                                key={appt.id}
                                                onClick={() => setSelectedAppointment(appt)}
                                                className={`w-full text-left px-1.5 py-1 rounded text-[9px] md:text-[10px] text-white truncate shadow-sm hover:brightness-110 transition-all ${isPending ? 'ring-2 ring-amber-400 ring-offset-1 border border-amber-500 animate-[pulse_2s_infinite]' : ''}`}
                                                style={{ backgroundColor: color }}
                                                title={`${isPending ? '[PENDING] ' : ''}${format(new Date(appt.start), 'h:mm a')} - ${getPatientName(appt.patientId)}`}
                                            >
                                                {format(new Date(appt.start), 'h:mm')}{format(new Date(appt.start), 'a').toLowerCase()} {getPatientName(appt.patientId)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} title="Manage Visit">
                {selectedAppointment && (
                    <div className="space-y-5">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-brand-blue-dark uppercase tracking-tight">{getServiceName(selectedAppointment.serviceId)}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[selectedAppointment.status].bg} ${statusColors[selectedAppointment.status].text}`}>
                                    {selectedAppointment.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
                                <p className="flex items-center"><UserIcon className="w-3 h-3 mr-2" /> <strong>Patient:</strong>&nbsp;<span className="text-gray-900">{getPatientName(selectedAppointment.patientId)}</span></p>
                                <p className="flex items-center"><UserIcon className="w-3 h-3 mr-2" /> <strong>Provider:</strong>&nbsp;<span className="text-gray-900">{getDentistName(selectedAppointment.dentistId)}</span></p>
                                <p className="flex items-center"><CalendarIcon className="w-3 h-3 mr-2" /> <strong>Date:</strong>&nbsp;<span className="text-gray-900">{format(new Date(selectedAppointment.start), 'eeee, MMM d')}</span></p>
                                <p className="flex items-center"><ClockIcon className="w-3 h-3 mr-2" /> <strong>Time:</strong>&nbsp;<span className="text-gray-900">{format(new Date(selectedAppointment.start), 'h:mm a')} - {format(new Date(selectedAppointment.end), 'h:mm a')}</span></p>
                            </div>
                        </div>

                        {selectedAppointment.status === AppointmentStatus.Pending && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 font-bold mb-3 uppercase tracking-wider">Awaiting Physician Approval</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleApprove}
                                        disabled={isUpdating}
                                        className="flex-1 py-2 bg-amber-500 text-white text-sm font-black rounded-lg hover:bg-amber-600 shadow transition-colors uppercase"
                                    >
                                        {isUpdating ? 'Sending...' : 'Approve & Confirm'}
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(AppointmentStatus.Cancelled)}
                                        disabled={isUpdating}
                                        className="px-4 py-2 bg-white text-gray-500 text-sm font-bold rounded-lg hover:bg-red-50 hover:text-red-600 border border-gray-200 transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Update Care Status</label>
                            <div className="flex flex-wrap gap-2">
                                {[AppointmentStatus.Completed, AppointmentStatus.Cancelled, AppointmentStatus.NoShow].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={selectedAppointment.status === status || isUpdating}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                                            selectedAppointment.status === status 
                                            ? 'bg-gray-100 text-gray-300 border-gray-100' 
                                            : 'bg-white text-gray-600 hover:border-brand-blue border-gray-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 2px; }
            `}</style>
        </div>
    );
};

export default FullCalendar;
