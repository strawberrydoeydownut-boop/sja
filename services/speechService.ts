
/**
 * Speech Service
 * Using native Web Speech API (SpeechSynthesis) to provide 
 * accessible voice feedback without external API dependencies.
 */

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure for a professional, clear sound
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a nice local voice (optional, defaults to system)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
    || voices.find(v => v.lang.startsWith('en')) 
    || voices[0];
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};
