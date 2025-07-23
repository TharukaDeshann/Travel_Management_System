import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import speechToTextService from '../services/speechToTextService';

const BotChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Supported languages
  const SUPPORTED_LANGUAGES = [
    { code: 'auto', label: 'Auto Detect (10 languages)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'si-LK', label: 'Sinhala (Sri Lanka)' },
    { code: 'ta-IN', label: 'Tamil (India)' },
    { code: 'hi-IN', label: 'Hindi (India)' },
    { code: 'zh-CN', label: 'Chinese (Mandarin)' },
    { code: 'ru-RU', label: 'Russian' },
    { code: 'de-DE', label: 'German' },
    { code: 'fr-FR', label: 'French' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'ar-SA', label: 'Arabic' },
  ];

  // Initialize speech service
  useEffect(() => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;
    
    if (speechKey && speechRegion) {
      const success = speechToTextService.initialize(speechKey, speechRegion, selectedLanguage);
      setIsInitialized(success);
      setError(success ? '' : 'Speech service not initialized. Please check your Azure credentials.');
      
      if (success) {
        speechToTextService.onResult(handleTranscript);
        speechToTextService.onError(handleError);
      }
    }
    
    return () => {
      speechToTextService.dispose();
    };
  }, [selectedLanguage]);

  const handleTranscript = (text) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      const input = iframe.contentWindow.document.querySelector('input[type="text"]');
      if (input) {
        input.value = text;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
    setError('');
  };

  const handleError = (error) => {
    console.error('Speech recognition error:', error);
    setError('Speech recognition failed. Please try again.');
    stopListening();
  };

  const startListening = () => {
    if (!isInitialized) {
      setError('Speech service not initialized. Please check your Azure credentials.');
      return;
    }
    
    setError('');
    const success = speechToTextService.startListening();
    if (!success) {
      setError('Failed to start speech recognition.');
    } else {
      setIsListening(true);
    }
  };

  const stopListening = () => {
    speechToTextService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Speech controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 bg-white p-2 rounded-lg shadow-md">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="p-1 border rounded text-sm"
          disabled={isListening}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
        
        <button
          onClick={toggleListening}
          disabled={!isInitialized}
          className={`p-2 rounded-full ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          } ${!isInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="absolute top-12 right-2 z-10 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Original iframe - unchanged */}
      <iframe
        src='https://webchat.botframework.com/embed/yamubot-bot?s=7KSf2Og9l5SOTAHGjVbTUKufs5SjfVkqZRS0JJA4sIr1Oi7ne7BFJQQJ99BGACYeBjFAArohAAABAZBS3kVx.1K6neZtC30Jsgj3bve5G5X12lv1X9wBV4KmMGKwdhJKtE7Nlu900JQQJ99BGACYeBjFAArohAAABAZBS4GOO'
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}
        title="Yamu Bot Chat"
      />
    </div>
  );
};

export default BotChat;