import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

class SpeechToTextService {
  constructor() {
    this.speechConfig = null;
    this.audioConfig = null;
    this.recognizer = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
  }

  // Initialize the speech service with your Azure credentials
  initialize(subscriptionKey, region, language = 'en-US') {
    try {
      this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
      this.speechConfig.speechRecognitionLanguage = language;
      
      // Configure for continuous recognition
      this.speechConfig.enableDictation();
      
      // Set output format to detailed
      this.speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;
      
      console.log('Speech service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize speech service:', error);
      return false;
    }
  }

  // Start listening for speech input
  startListening() {
    if (!this.speechConfig) {
      console.error('Speech service not initialized');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return false;
    }

    try {
      // Create audio config for microphone input
      this.audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      
      // Create recognizer
      this.recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, this.audioConfig);

      // Set up event handlers
      this.setupEventHandlers();

      // Start continuous recognition
      this.recognizer.startContinuousRecognitionAsync(
        () => {
          this.isListening = true;
          console.log('Started listening');
          if (this.onStartCallback) this.onStartCallback();
        },
        (error) => {
          console.error('Failed to start recognition:', error);
          if (this.onErrorCallback) this.onErrorCallback(error);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.onErrorCallback) this.onErrorCallback(error);
      return false;
    }
  }

  // Stop listening
  stopListening() {
    if (!this.recognizer || !this.isListening) {
      console.log('Not currently listening');
      return false;
    }

    try {
      this.recognizer.stopContinuousRecognitionAsync(
        () => {
          this.isListening = false;
          console.log('Stopped listening');
          if (this.onEndCallback) this.onEndCallback();
        },
        (error) => {
          console.error('Failed to stop recognition:', error);
          if (this.onErrorCallback) this.onErrorCallback(error);
        }
      );

      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      if (this.onErrorCallback) this.onErrorCallback(error);
      return false;
    }
  }

  // Set up event handlers for the recognizer
  setupEventHandlers() {
    if (!this.recognizer) return;

    // Handle recognition results
    this.recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const transcript = e.result.text;
        console.log('Recognized:', transcript);
        if (this.onResultCallback) this.onResultCallback(transcript);
      }
    };

    // Handle recognition start
    this.recognizer.recognizing = (s, e) => {
      console.log('Recognizing...');
    };

    // Handle session start
    this.recognizer.sessionStarted = (s, e) => {
      console.log('Session started');
    };

    // Handle session end
    this.recognizer.sessionStopped = (s, e) => {
      console.log('Session stopped');
    };

    // Handle errors
    this.recognizer.canceled = (s, e) => {
      console.error('Recognition canceled:', e.reason);
      if (e.reason === SpeechSDK.CancellationReason.Error) {
        console.error('Error details:', e.errorDetails);
      }
      if (this.onErrorCallback) this.onErrorCallback(e);
    };
  }

  // Set callback functions
  onResult(callback) {
    this.onResultCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onStart(callback) {
    this.onStartCallback = callback;
  }

  onEnd(callback) {
    this.onEndCallback = callback;
  }

  // Check if currently listening
  getListeningStatus() {
    return this.isListening;
  }

  // Clean up resources
  dispose() {
    if (this.recognizer) {
      this.recognizer.dispose();
      this.recognizer = null;
    }
    this.isListening = false;
  }

  // Add this method to the SpeechToTextService class
  addPhraseList(phrases = []) {
    if (this.recognizer && phrases.length > 0) {
      const phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(this.recognizer);
      phrases.forEach(phrase => phraseListGrammar.addPhrase(phrase));
    }
  }
}

// Create and export a singleton instance
const speechToTextService = new SpeechToTextService();
export default speechToTextService; 