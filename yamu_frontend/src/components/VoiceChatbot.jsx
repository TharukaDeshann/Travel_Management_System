import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, MessageCircle, User } from 'lucide-react';
import useSpeechToText from '../hooks/useSpeechToText';

const VoiceChatbot = ({ 
  subscriptionKey, 
  region = 'eastus',
  language = 'en-US',
  onSendMessage 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your travel assistant. How can I help you plan your trip today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const {
    isListening,
    transcript,
    error,
    isInitialized,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript
  } = useSpeechToText({
    subscriptionKey,
    region,
    language,
    onTranscript: (text) => {
      setInputText(text);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Call the parent callback if provided
    if (onSendMessage) {
      onSendMessage(inputText);
    }

    // Simulate bot response (replace with actual chatbot API call)
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputText('');
    clearTranscript();
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hotel') || input.includes('accommodation')) {
      return 'I can help you find hotels! What city are you planning to visit?';
    } else if (input.includes('flight') || input.includes('airline')) {
      return 'I can assist with flight bookings. What are your travel dates?';
    } else if (input.includes('tour') || input.includes('guide')) {
      return 'Great! I can connect you with local guides. What type of tour are you interested in?';
    } else if (input.includes('weather')) {
      return 'I can provide weather information for your destination. Which city would you like to check?';
    } else if (input.includes('restaurant') || input.includes('food')) {
      return 'I can recommend local restaurants! What type of cuisine do you prefer?';
    } else {
      return 'I understand you\'re planning a trip. I can help with hotels, flights, tours, weather, and restaurant recommendations. What would you like to know more about?';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <MessageCircle size={20} />
          <div>
            <h3 className="font-semibold">Travel Assistant</h3>
            <p className="text-sm text-blue-100">
              {isListening ? 'Listening...' : 'Voice-enabled chatbot'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <MessageCircle size={16} className="mt-1 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          {/* Voice Button */}
          <button
            onClick={toggleListening}
            disabled={!isInitialized}
            className={`
              p-2 rounded-full transition-all duration-200
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }
              ${!isInitialized ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Type your message..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isListening}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Speak now... Your voice will be converted to text
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatbot; 