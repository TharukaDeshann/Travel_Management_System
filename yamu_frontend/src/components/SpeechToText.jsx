import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import speechToTextService from '../services/speechToTextService';

// Supported languages for dropdown
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

// Example phrase lists (expand as needed)
const PHRASE_LISTS = {
  'en-US': ['Colombo', 'Kandy', 'Galle', 'I want to go to', 'hotel', 'guide', 'weather'],
  'si-LK': ['මම යන්න ඕන', 'කොළඹ', 'මහනුවර', 'හෝටලය', 'මාව උදව් කරන්න', 'මාව මග පෙන්වන්න'],
  'ta-IN': ['நான் செல்ல விரும்புகிறேன்', 'யாழ்ப்பாணம்', 'கொழும்பு', 'ஹோட்டல்', 'வழிகாட்டி'],
  'hi-IN': ['मैं जाना चाहता हूँ', 'कोलंबो', 'कैंडी', 'होटल', 'गाइड', 'मौसम'],
  'zh-CN': ['科伦坡', '康提', '加勒', '我想去', '酒店', '导游', '天气'],
  'ru-RU': ['Коломбо', 'Канди', 'Галле', 'Я хочу поехать', 'отель', 'гид', 'погода'],
  'de-DE': ['Colombo', 'Kandy', 'Galle', 'Ich möchte gehen', 'Hotel', 'Reiseführer', 'Wetter'],
  'fr-FR': ['Colombo', 'Kandy', 'Galle', 'Je veux aller', 'hôtel', 'guide', 'météo'],
  'ja-JP': ['コロンボ', 'キャンディ', 'ゴール', '行きたい', 'ホテル', 'ガイド', '天気'],
  'ar-SA': ['كولومبو', 'كاندي', 'جالي', 'أريد أن أذهب', 'فندق', 'دليل', 'طقس'],
};

const AUTO_LANGUAGES = [
  'en-US', 'si-LK', 'ta-IN', 'hi-IN', 'zh-CN', 'ru-RU', 'de-DE', 'fr-FR', 'ja-JP', 'ar-SA'
];

const SpeechToText = forwardRef(({
  onTranscriptReceived,
  subscriptionKey,
  region = 'eastus',
  language = 'en-US',
  className = '',
  placeholder = "Click the microphone to start speaking...",
  showTranscript = true,
  autoStop = true,
  autoStopDelay = 3000,
  phrases = null // Optional: pass custom phrase list
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en-US');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [initTries, setInitTries] = useState(0);
  const autoStopTimeoutRef = useRef(null);

  // Expose control methods to parent
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    clearTranscript,
  }));

  // Initialize the speech service on component mount or language change
  useEffect(() => {
    let lang = selectedLanguage;
    if (lang === 'auto') lang = 'en-US'; // fallback for init
    if (subscriptionKey && region) {
      const success = speechToTextService.initialize(subscriptionKey, region, lang);
      setIsInitialized(success);
      setError(success ? '' : 'Speech service not initialized. Please check your Azure credentials.');
      if (success) {
        speechToTextService.onResult(handleTranscript);
        speechToTextService.onError(handleError);
        speechToTextService.onStart(handleStart);
        speechToTextService.onEnd(handleEnd);
      }
    }
    return () => {
      speechToTextService.dispose();
    };
    // eslint-disable-next-line
  }, [subscriptionKey, region, selectedLanguage, initTries]);

  // Add phrase list after recognizer is created
  useEffect(() => {
    if (isInitialized) {
      const lang = selectedLanguage === 'auto' ? 'en-US' : selectedLanguage;
      const phraseList = phrases || PHRASE_LISTS[lang] || [];
      speechToTextService.addPhraseList(phraseList);
    }
    // eslint-disable-next-line
  }, [isInitialized, selectedLanguage, phrases]);

  const handleTranscript = (text) => {
    setTranscript(text);
    setError('');
    if (onTranscriptReceived) {
      onTranscriptReceived(text);
    }
    // Auto-stop functionality
    if (autoStop) {
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
      autoStopTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, autoStopDelay);
    }
    // Try to get detected language from Azure result (if available)
    // (This requires service support; placeholder for now)
    // setDetectedLanguage(...)
  };

  const handleError = (error) => {
    console.error('Speech recognition error:', error);
    setError('Speech recognition failed. Please try again.');
    setIsListening(false);
  };

  const handleStart = () => {
    setIsListening(true);
    setError('');
  };

  const handleEnd = () => {
    setIsListening(false);
  };

  const startListening = () => {
    if (!isInitialized) {
      setError('Speech service not initialized. Please check your Azure credentials.');
      return;
    }
    setError('');
    setTranscript('');
    setDetectedLanguage('');
    const success = speechToTextService.startListening();
    if (!success) {
      setError('Failed to start speech recognition.');
    }
  };

  const stopListening = () => {
    speechToTextService.stopListening();
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    if (onTranscriptReceived) {
      onTranscriptReceived('');
    }
  };

  const handleTranscriptEdit = (e) => {
    setTranscript(e.target.value);
    if (onTranscriptReceived) {
      onTranscriptReceived(e.target.value);
    }
  };

  const handleRetryInit = () => {
    setInitTries(t => t + 1);
    setError('');
  };

  return (
    <div className={`speech-to-text ${className}`}>
      {/* Language Selector */}
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Language:</label>
        <select
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
          className="p-2 border rounded-lg bg-blue-50 text-blue-700 font-semibold focus:ring-2 focus:ring-blue-400"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
        {selectedLanguage === 'auto' && detectedLanguage && (
          <span className="ml-2 text-xs text-blue-600">Detected: {detectedLanguage}</span>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={toggleListening}
          disabled={!isInitialized}
          className={`
            relative p-4 rounded-full transition-all duration-300 ease-in-out
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110' 
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
            }
            ${!isInitialized ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <MicOff size={24} className="animate-pulse" />
          ) : (
            <Mic size={24} />
          )}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
          )}
        </button>
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {isListening ? (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Listening...</span>
            </>
          ) : isInitialized ? (
            <>
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">Ready</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-600">Not initialized</span>
              <button onClick={handleRetryInit} className="ml-2 text-blue-500 hover:underline flex items-center gap-1 text-xs"><RefreshCw size={14}/>Retry</button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Transcript Display & Edit */}
      {showTranscript && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Transcript</h3>
            {transcript && (
              <button
                onClick={clearTranscript}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={handleTranscriptEdit}
            placeholder={placeholder}
            className="min-h-[80px] w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 leading-relaxed"
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {isListening ? (
          <p>Speak clearly into your microphone. Click the button again to stop.</p>
        ) : (
          <p>Click the microphone button to start voice recognition</p>
        )}
      </div>
    </div>
  );
});

export default SpeechToText; 