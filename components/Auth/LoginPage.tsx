
import React, { useState } from 'react';
import { User, Appointment, VirtualEmail } from '../../types';
import { login, register, getAppointmentsForEmail, getEmailsForAddress } from '../../services/mockApi';
import Modal from '../Shared/Modal';
import { format } from 'date-fns';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Status Check State
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResults, setStatusResults] = useState<{appts: Appointment[], emails: VirtualEmail[]} | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Registration-specific state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const user = await login(email, password);
    setIsLoading(false);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setError('');
    setIsLoading(true);
    
    const result = await register({
        name,
        email,
        password_reg: password,
        phone,
        age: parseInt(age, 10),
        gender
    });
    
    setIsLoading(false);

    if (result.user) {
        onLogin(result.user);
    } else {
        setError(result.error || 'An unknown error occurred during registration.');
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!statusEmail) return;
    setIsCheckingStatus(true);
    const [appts, emails] = await Promise.all([
        getAppointmentsForEmail(statusEmail),
        getEmailsForAddress(statusEmail)
    ]);
    setStatusResults({ appts, emails });
    setIsCheckingStatus(false);
  };
  
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center">
             <svg className="h-12 w-12 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-blue-dark">
            {isRegistering ? 'Create Your Account' : 'Welcome to NexSched'}
          </h2>
        </div>

        {isRegistering ? (
             <form className="mt-8 space-y-4 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleRegisterSubmit}>
                <div className="grid grid-cols-1 gap-y-4">
                    <input name="name" type="text" required className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                    <input name="email" type="email" required className="input-field" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
                    <input name="phone" type="tel" required className="input-field" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="age" type="number" required className="input-field" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
                        <select name="gender" required className="input-field" value={gender} onChange={e => setGender(e.target.value as any)}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <input name="password" type="password" required className="input-field" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <input name="confirmPassword" type="password" required className="input-field" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <div className="text-center text-sm">
                    <button type="button" onClick={toggleForm} className="font-medium text-brand-blue hover:text-brand-blue-dark">
                        Already have an account? Sign In
                    </button>
                </div>
            </form>
        ) : (
            <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleLoginSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <input
                    id="email-address-login"
                    type="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    id="password-login"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="flex flex-col gap-4 text-center text-sm">
                  <button type="button" onClick={toggleForm} className="font-medium text-brand-blue hover:text-brand-blue-dark">
                      Don't have an account? Sign Up
                  </button>
                  <div className="border-t pt-4">
                      <button type="button" onClick={() => setShowStatusModal(true)} className="text-gray-500 hover:text-brand-blue-dark font-medium underline">
                          Check my appointment status via email
                      </button>
                  </div>
              </div>
            </form>
        )}
      </div>

      <Modal isOpen={showStatusModal} onClose={() => {setShowStatusModal(false); setStatusResults(null);}} title="Check My Appointment Status">
          <div className="space-y-4">
              <p className="text-xs text-gray-500">Enter the email you used during booking to see your current schedule and communications.</p>
              <form onSubmit={handleCheckStatus} className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    className="flex-1 border p-2 rounded text-sm" 
                    value={statusEmail}
                    onChange={e => setStatusEmail(e.target.value)}
                  />
                  <button disabled={isCheckingStatus} className="bg-brand-blue text-white px-4 py-2 rounded text-sm font-bold">
                      {isCheckingStatus ? '...' : 'Find'}
                  </button>
              </form>

              {statusResults && (
                  <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
                      <h4 className="font-bold text-gray-800 border-b pb-1">Appointments</h4>
                      {statusResults.appts.length === 0 ? <p className="text-xs text-gray-400">No records found for this email.</p> : (
                          statusResults.appts.map(a => (
                              <div key={a.id} className="p-3 bg-gray-50 rounded border text-sm">
                                  <div className="flex justify-between font-bold">
                                      <span>{format(new Date(a.start), 'MMM d, h:mm a')}</span>
                                      <span className={`uppercase text-[10px] ${a.status === 'scheduled' ? 'text-green-600' : 'text-amber-600'}`}>{a.status}</span>
                                  </div>
                              </div>
                          ))
                      )}

                      <h4 className="font-bold text-gray-800 border-b pb-1 mt-4">Professional Emails</h4>
                      {statusResults.emails.length === 0 ? <p className="text-xs text-gray-400">No emails sent yet.</p> : (
                          statusResults.emails.map(e => (
                              <div key={e.id} className="p-3 bg-blue-50/50 rounded border border-blue-100 text-[11px] space-y-1">
                                  <p className="font-bold text-brand-blue-dark">{e.subject}</p>
                                  <p className="text-gray-600 italic">"{e.body}"</p>
                                  <p className="text-[9px] text-gray-400 text-right">{format(new Date(e.timestamp), 'MMM d, h:mm a')}</p>
                              </div>
                          ))
                      )}
                  </div>
              )}
          </div>
      </Modal>

      <style>{`.input-field { appearance: none; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; color: #111827; } .input-field:focus { outline: none; box-shadow: 0 0 0 2px #3182CE; border-color: #3182CE; }`}</style>
    </div>
  );
};

export default LoginPage;
