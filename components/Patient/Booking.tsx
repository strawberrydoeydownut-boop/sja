
import React, { useState, useMemo, useEffect } from 'react';
import { User, Dentist, Service, TimeSlot } from '../../types';
import { getAvailableTimeSlots, bookAppointment, register } from '../../services/mockApi';
import { format, endOfMonth, eachDayOfInterval, getDay, isToday, isBefore, addMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '../Shared/Icons';
import Modal from '../Shared/Modal';

interface BookingProps {
    user?: User;
    dentists: Dentist[];
    services: Service[];
    onBookingSuccess: () => void;
    onBack?: () => void;
}

const Booking: React.FC<BookingProps> = ({ user, dentists, services, onBookingSuccess, onBack }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDentist, setSelectedDentist] = useState<string>(dentists[0]?.id || '');
    const [selectedService, setSelectedService] = useState<string>('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    // Guest State
    const [guestDetails, setGuestDetails] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'Male'
    });

    const filteredServices = useMemo(() => {
        const dentist = dentists.find(d => d.id === selectedDentist);
        if (!dentist || !dentist.serviceIds) return services;
        return services.filter(s => dentist.serviceIds!.includes(s.id));
    }, [selectedDentist, dentists, services]);

    useEffect(() => {
        if (filteredServices.length > 0) {
            if (!selectedService || !filteredServices.find(s => s.id === selectedService)) {
                setSelectedService(filteredServices[0].id);
            }
        } else {
            setSelectedService('');
        }
    }, [filteredServices, selectedService]);

    const firstDayOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
    const lastDayOfMonth = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
    const daysInMonth = useMemo(() => eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth }), [firstDayOfMonth, lastDayOfMonth]);
    const startingDayIndex = getDay(firstDayOfMonth);

    useEffect(() => {
        if (!selectedDentist && dentists.length > 0) setSelectedDentist(dentists[0].id);
    }, [dentists]);

    useEffect(() => {
        if (selectedDate && selectedDentist && selectedService) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                setTimeSlots([]);
                const slots = await getAvailableTimeSlots(selectedDate, selectedDentist, selectedService);
                setTimeSlots(slots);
                setIsLoadingSlots(false);
            };
            fetchSlots();
        }
    }, [selectedDate, selectedDentist, selectedService]);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const handleDateClick = (day: Date) => {
        if (isBefore(day, todayStart)) return;
        setSelectedDate(day);
        setSelectedTime(null);
    };

    const handleBookAppointment = async () => {
        if (!selectedTime || !selectedDentist || !selectedService) return;
        
        setIsBooking(true);
        try {
            let bookingUserId = user?.id;
            let finalEmail = user?.email;

            if (!bookingUserId) {
                if (!guestDetails.name || !guestDetails.email || !guestDetails.phone || !guestDetails.age) {
                    alert("All fields are required to process your booking request.");
                    setIsBooking(false);
                    return;
                }

                const regResult = await register({
                    name: guestDetails.name,
                    email: guestDetails.email,
                    phone: guestDetails.phone,
                    age: parseInt(guestDetails.age) || 30,
                    gender: guestDetails.gender as any,
                    password_reg: 'Welcome123!'
                });

                if (regResult.error || !regResult.user) {
                    alert(regResult.error || "Request failed. Please try again.");
                    setIsBooking(false);
                    return;
                }
                bookingUserId = regResult.user.id;
                finalEmail = regResult.user.email;
            }

            await bookAppointment({
                patientId: bookingUserId!,
                dentistId: selectedDentist,
                serviceId: selectedService,
                start: selectedTime
            });

            alert(`REQUEST SUBMITTED\n\nYour appointment for ${services.find(s => s.id === selectedService)?.name} has been sent for approval. Check your Virtual Inbox at ${finalEmail} for the status update.`);
            
            onBookingSuccess();
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to process request. Please try again.");
        } finally {
            setIsBooking(false);
            setIsConfirming(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
                {onBack && <button onClick={onBack} className="text-sm text-brand-blue hover:underline">Back to Dashboard</button>}
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md mb-6 border border-amber-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-xs text-amber-800 font-medium">All bookings require dentist approval. You will be notified via email once your visit is confirmed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Provider</label>
                        <select id="dentist" value={selectedDentist} onChange={e => setSelectedDentist(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm">
                            {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Requested Service</label>
                        <select id="service" value={selectedService} onChange={e => setSelectedService(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md shadow-sm">
                            {filteredServices.length > 0 ? filteredServices.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            )) : <option value="">No services available</option>}
                        </select>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-bold">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(day => {
                            const isPast = isBefore(day, todayStart);
                            const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                                <div key={day.toString()} className="flex justify-center items-center">
                                    <button 
                                        onClick={() => handleDateClick(day)}
                                        disabled={isPast}
                                        className={`w-10 h-10 rounded-lg transition-all duration-200 border ${
                                            isPast ? 'text-gray-300 border-transparent cursor-not-allowed' : 
                                            isSelected ? 'bg-brand-blue text-white border-brand-blue shadow-md' :
                                            isToday(day) ? 'text-brand-blue font-black border-brand-blue/20' : 'hover:bg-brand-blue-light border-gray-50'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Available Times: {format(selectedDate, 'MMM d, yyyy')}</h3>
                    {isLoadingSlots ? <p className="text-sm animate-pulse text-gray-400">Checking schedule...</p> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {timeSlots.filter(s => s.isAvailable).length > 0 ? timeSlots.filter(s => s.isAvailable).map(slot => (
                                <button
                                    key={slot.time.toISOString()}
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`p-2 rounded-md text-sm font-medium border transition-all ${selectedTime?.getTime() === slot.time.getTime() ? 'bg-brand-blue text-white border-brand-blue shadow-inner' : 'bg-white hover:border-brand-blue text-gray-700'}`}
                                >
                                    {format(slot.time, 'h:mm a')}
                                </button>
                            )) : <p className="col-span-full text-gray-500 italic">No slots available for this date.</p>}
                        </div>
                    )}
                </div>
            )}

            {selectedTime && (
                <div className="mt-8 flex justify-end">
                    <button onClick={() => setIsConfirming(true)} className="px-8 py-3 bg-brand-blue text-white font-bold rounded-lg shadow-lg hover:bg-brand-blue-dark transition-all transform hover:scale-105 active:scale-95">
                        {user ? 'Request Appointment' : 'Next: Contact Info'}
                    </button>
                </div>
            )}

            <Modal isOpen={isConfirming} onClose={() => setIsConfirming(false)} title="Request Booking">
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs font-black text-gray-400 uppercase mb-2">Selected Visit</p>
                        <p className="text-sm"><strong>Treatment:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                        <p className="text-sm"><strong>Provider:</strong> {dentists.find(d => d.id === selectedDentist)?.name}</p>
                        <p className="text-sm"><strong>Date/Time:</strong> {selectedDate && format(selectedDate, 'MMM d')} @ {selectedTime && format(selectedTime, 'h:mm a')}</p>
                    </div>

                    {!user && (
                        <div className="pt-2">
                            <h4 className="font-bold text-gray-800 mb-2">Notification Details</h4>
                            <p className="text-[10px] text-gray-500 mb-3 uppercase font-bold tracking-widest">Communications will be sent to this email only</p>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="w-full border p-2 rounded text-sm"
                                    value={guestDetails.name} 
                                    onChange={e => setGuestDetails({...guestDetails, name: e.target.value})}
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    className="w-full border p-2 rounded text-sm"
                                    value={guestDetails.email} 
                                    onChange={e => setGuestDetails({...guestDetails, email: e.target.value})}
                                />
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    className="w-full border p-2 rounded text-sm"
                                    value={guestDetails.phone} 
                                    onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Age" 
                                        className="w-full border p-2 rounded text-sm"
                                        value={guestDetails.age} 
                                        onChange={e => setGuestDetails({...guestDetails, age: e.target.value})}
                                    />
                                    <select 
                                        className="w-full border p-2 rounded text-sm"
                                        value={guestDetails.gender} 
                                        onChange={e => setGuestDetails({...guestDetails, gender: e.target.value})}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={() => setIsConfirming(false)} className="px-4 py-2 text-gray-500 font-semibold">Cancel</button>
                        <button onClick={handleBookAppointment} disabled={isBooking} className="px-6 py-2 bg-brand-blue text-white rounded-md font-bold disabled:bg-gray-400">
                            {isBooking ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Booking;
