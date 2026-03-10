
import React, { useState, useEffect } from 'react';
import { Dentist, Service, ClinicSettings } from '../../types';
import { getDentists, getServices, getClinicSettings } from '../../services/mockApi';
import Booking from '../Patient/Booking';

const PublicBooking: React.FC = () => {
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicData = async () => {
            setIsLoading(true);
            try {
                const [d, s, c] = await Promise.all([
                    getDentists(),
                    getServices(),
                    getClinicSettings()
                ]);
                setDentists(d);
                setServices(s);
                setSettings(c);
            } catch (error) {
                console.error("Failed to load public data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicData();
    }, []);

    const handleSuccess = () => {
        // After success, we reload the page. 
        // Since register() logs the user in, reloading the page will let App.tsx pick up the session 
        // and redirect them to the Patient Dashboard where they can see their new appointment.
        window.location.href = window.location.origin;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading clinic schedule...</p>
            </div>
        );
    }

    if (!settings?.onlineBookingEnabled) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{settings?.clinicName}</h1>
                <p className="text-red-500 bg-white p-6 rounded-lg shadow-md">Online booking is currently disabled. Please contact the clinic directly.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-blue-light py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <svg className="mx-auto h-12 w-12 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{settings?.clinicName}</h1>
                    <p className="mt-2 text-lg text-gray-600">Schedule your appointment online</p>
                </div>
                
                <Booking 
                    dentists={dentists}
                    services={services}
                    onBookingSuccess={handleSuccess}
                    // No onBack prop means the "Back" button won't show
                />
            </div>
        </div>
    );
};

export default PublicBooking;
