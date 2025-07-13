import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import speechToTextService from '../services/speechToTextService';

const SpeechToText = ({ 
  onTranscriptReceived, 
  subscriptionKey, 
  region = 'eastus',
  language = 'en-US',
  className = '',
  placeholder = "Click the microphone to start speaking...",
  showTranscript = true,
  autoStop = true,
  autoStopDelay = 3000 // Stop after 3 seconds of silence
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const autoStopTimeoutRef = useRef(null);

  // Initialize the speech service on component mount
  useEffect(() => {
    if (subscriptionKey && region) {
      const success = speechToTextService.initialize(subscriptionKey, region, language);
      setIsInitialized(success);
      
      if (success) {
        // Set up event handlers
        speechToTextService.onResult(handleTranscript);
        speechToTextService.onError(handleError);
        speechToTextService.onStart(handleStart);
        speechToTextService.onEnd(handleEnd);
      }
    }

    // Cleanup on unmount
    return () => {
      speechToTextService.dispose();
    };
  }, [subscriptionKey, region, language]);

  const handleTranscript = (text) => {
    setTranscript(text);
    setError('');
    
    // Call the parent callback if provided
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

  return (
    <div className={`speech-to-text ${className}`}>
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
          
          {/* Animated ring when listening */}
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

      {/* Transcript Display */}
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
          
          <div className="min-h-[80px] p-3 bg-gray-50 border border-gray-200 rounded-lg">
            {transcript ? (
              <p className="text-gray-800 leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">{placeholder}</p>
            )}
          </div>
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
};

export default SpeechToText; 