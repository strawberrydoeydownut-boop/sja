
import React, { useState, useEffect } from 'react';

const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    grayscale: false
  });

  useEffect(() => {
    const root = document.documentElement;
    if (settings.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    
    if (settings.largeText) root.classList.add('large-text');
    else root.classList.remove('large-text');

    if (settings.grayscale) root.classList.add('grayscale-mode');
    else root.classList.remove('grayscale-mode');
  }, [settings]);

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-end">
      <div className={`bg-white shadow-2xl rounded-2xl p-4 mb-2 border border-gray-200 transition-all duration-300 origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <h3 className="text-sm font-black uppercase text-gray-400 mb-4 border-b pb-1">Accessibility Center</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setSettings(s => ({...s, highContrast: !s.highContrast}))}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-bold border transition-colors ${settings.highContrast ? 'bg-brand-blue text-white border-brand-blue' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            High Contrast <span>{settings.highContrast ? 'ON' : 'OFF'}</span>
          </button>
          <button 
            onClick={() => setSettings(s => ({...s, largeText: !s.largeText}))}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-bold border transition-colors ${settings.largeText ? 'bg-brand-blue text-white border-brand-blue' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            Extra Large Text <span>{settings.largeText ? 'ON' : 'OFF'}</span>
          </button>
          <button 
            onClick={() => setSettings(s => ({...s, grayscale: !s.grayscale}))}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-bold border transition-colors ${settings.grayscale ? 'bg-brand-blue text-white border-brand-blue' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            Grayscale Mode <span>{settings.grayscale ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-blue text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="Toggle Accessibility Menu"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </button>

      <style>{`
        .large-text { font-size: 1.25rem !important; }
        .large-text h1 { font-size: 3rem !important; }
        .large-text h2 { font-size: 2.5rem !important; }
        .large-text p, .large-text button, .large-text input { font-size: 1.2rem !important; }
        
        .high-contrast { background-color: #000 !important; }
        .high-contrast * { color: #fff !important; border-color: #fff !important; }
        .high-contrast button { background-color: #ffff00 !important; color: #000 !important; font-weight: 900 !important; }
        .high-contrast .bg-white, .high-contrast .bg-gray-50 { background-color: #000 !important; }
        
        .grayscale-mode { filter: grayscale(100%); }
      `}</style>
    </div>
  );
};

export default AccessibilityToolbar;
