
import React, { useState, useEffect } from 'react';
import { Dentist } from '../../types';
import { getDentists, addDentist, deleteDentist } from '../../services/mockApi';
import Modal from '../Shared/Modal';
import { UserIcon } from '../Shared/Icons';

const DentistManagement: React.FC = () => {
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New Dentist Form
    const [newName, setNewName] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newColor, setNewColor] = useState('#0284c7');
    const [isSaving, setIsSaving] = useState(false);

    const fetchDentists = async () => {
        setIsLoading(true);
        const data = await getDentists();
        setDentists(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDentists();
    }, []);

    const handleAddDentist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newSpecialty) return;
        
        setIsSaving(true);
        try {
            await addDentist({
                name: newName,
                specialty: newSpecialty,
                color: newColor
            });
            setNewName('');
            setNewSpecialty('');
            setNewColor('#0284c7');
            setIsModalOpen(false);
            fetchDentists();
        } catch (error) {
            console.error(error);
            alert("Failed to add dentist.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to remove this dentist? This may affect existing calendar views.")) {
            await deleteDentist(id);
            fetchDentists();
        }
    };

    if (isLoading) return <p className="p-4">Loading dentist list...</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dentist Management</h2>
                    <p className="text-sm text-gray-500">Manage your clinic's professional staff</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-brand-blue-dark transition duration-150"
                >
                    Add New Dentist
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dentists.map(dentist => (
                    <div key={dentist.id} className="border border-gray-200 rounded-xl p-4 relative overflow-hidden flex items-center shadow-sm hover:shadow-md transition-shadow">
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-2" 
                            style={{ backgroundColor: dentist.color }}
                        />
                        <div className="bg-brand-gray-light rounded-full p-3 mr-4">
                            <UserIcon className="w-8 h-8 text-brand-gray-dark" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{dentist.name}</h3>
                            <p className="text-sm text-brand-blue font-medium">{dentist.specialty}</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs text-gray-400 italic">Calendar Color:</span>
                                <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: dentist.color }} />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(dentist.id)}
                            className="text-gray-400 hover:text-red-500 p-2"
                            title="Delete Dentist"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Professional Staff">
                <form onSubmit={handleAddDentist} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Dr. John Doe"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Specialty</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. General Dentistry, Orthodontics"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Calendar Identification Color</label>
                        <div className="flex items-center mt-1 space-x-4">
                            <input 
                                type="color" 
                                className="h-10 w-10 border-none cursor-pointer rounded"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                            />
                            <span className="text-sm text-gray-500 uppercase font-mono">{newColor}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">This color will be used to label their appointments in the main calendar.</p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
                        >
                            {isSaving ? 'Adding...' : 'Add Dentist'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DentistManagement;
