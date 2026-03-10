
import React, { useState, useEffect } from 'react';
import { ClinicSettings } from '../../types';
import { getClinicSettings, updateClinicSettings } from '../../services/mockApi';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const data = await getClinicSettings();
            setSettings(data);
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await updateClinicSettings(settings);
            alert("Settings saved successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyLink = () => {
        // Simulating the booking URL based on current location
        const url = `${window.location.origin}/book/${settings?.clinicName.toLowerCase().replace(/\s+/g, '-')}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    if (isLoading) return <p className="p-4">Loading settings...</p>;
    if (!settings) return <p className="p-4">Error loading settings.</p>;

    const publicLink = `${window.location.origin}/book/${settings.clinicName.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Clinic Settings & Publishing</h2>
            </div>

            <div className="space-y-8">
                {/* Publishing Section */}
                <section>
                     <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        Online Publishing
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-medium text-gray-900">Accept Online Appointments</h4>
                                <p className="text-sm text-gray-500">Enable or disable the public booking page for patients.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, onlineBookingEnabled: !settings.onlineBookingEnabled })}
                                className={`${settings.onlineBookingEnabled ? 'bg-brand-blue' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue`}
                            >
                                <span className={`${settings.onlineBookingEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                            </button>
                        </div>

                        {settings.onlineBookingEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Public Booking Link</label>
                                <div className="flex rounded-md shadow-sm">
                                    <div className="relative flex-grow focus-within:z-10">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={publicLink}
                                            className="focus:ring-brand-blue focus:border-brand-blue block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2 border bg-white text-gray-500"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleCopyLink}
                                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                                    >
                                        <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Share this link on your website or social media to let patients book appointments directly.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* General Settings */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Clinic Information
                    </h3>
                     <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                            <input 
                                type="text" 
                                value={settings.clinicName}
                                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            />
                        </div>
                        {/* Future settings like Phone, Address, Slot Duration could go here */}
                     </div>
                </section>

                {/* Booking Logic Settings */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Booking Logic
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slot Duration (Minutes)</label>
                            <input 
                                type="number" 
                                value={settings.slotDurationMinutes}
                                onChange={(e) => setSettings({ ...settings, slotDurationMinutes: parseInt(e.target.value) || 15 })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Interval between available booking times.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Holidays</label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input 
                                        type="date" 
                                        id="new-holiday"
                                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    />
                                    <button 
                                        onClick={() => {
                                            const input = document.getElementById('new-holiday') as HTMLInputElement;
                                            if (input.value && !settings.holidays.includes(input.value)) {
                                                setSettings({ ...settings, holidays: [...settings.holidays, input.value] });
                                                input.value = '';
                                            }
                                        }}
                                        className="px-3 py-1 bg-brand-blue text-white rounded text-sm font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                    {settings.holidays.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No holidays added.</p>
                                    ) : settings.holidays.sort().map(h => (
                                        <div key={h} className="flex justify-between items-center bg-white p-2 rounded border text-xs">
                                            <span>{h}</span>
                                            <button 
                                                onClick={() => setSettings({ ...settings, holidays: settings.holidays.filter(date => date !== h) })}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-5 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
