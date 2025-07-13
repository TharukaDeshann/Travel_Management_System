import { useState, useEffect, useCallback } from 'react';
import speechToTextService from '../services/speechToTextService';

const useSpeechToText = ({
  subscriptionKey,
  region = 'eastus',
  language = 'en-US',
  autoStop = true,
  autoStopDelay = 3000,
  onTranscript,
  onError,
  onStart,
  onEnd
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the speech service
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

  const handleTranscript = useCallback((text) => {
    setTranscript(text);
    setError('');
    
    // Call the parent callback if provided
    if (onTranscript) {
      onTranscript(text);
    }
  }, [onTranscript]);

  const handleError = useCallback((error) => {
    console.error('Speech recognition error:', error);
    setError('Speech recognition failed. Please try again.');
    setIsListening(false);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const handleStart = useCallback(() => {
    setIsListening(true);
    setError('');
    
    if (onStart) {
      onStart();
    }
  }, [onStart]);

  const handleEnd = useCallback(() => {
    setIsListening(false);
    
    if (onEnd) {
      onEnd();
    }
  }, [onEnd]);

  const startListening = useCallback(() => {
    if (!isInitialized) {
      setError('Speech service not initialized. Please check your Azure credentials.');
      return false;
    }

    setError('');
    setTranscript('');
    
    const success = speechToTextService.startListening();
    if (!success) {
      setError('Failed to start speech recognition.');
      return false;
    }
    return true;
  }, [isInitialized]);

  const stopListening = useCallback(() => {
    speechToTextService.stopListening();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    if (onTranscript) {
      onTranscript('');
    }
  }, [onTranscript]);

  const reset = useCallback(() => {
    setTranscript('');
    setError('');
    setIsListening(false);
  }, []);

  return {
    // State
    isListening,
    transcript,
    error,
    isInitialized,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    reset,
    
    // Service status
    getListeningStatus: () => speechToTextService.getListeningStatus()
  };
};

export default useSpeechToText; 