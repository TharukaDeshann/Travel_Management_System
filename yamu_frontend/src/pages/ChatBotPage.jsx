import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BotChat from '../components/BotChat';
import botImage from '../images/bot-image.png';

const ChatBotPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    // Add scroll event listener to the chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back
          </button>
          <h1 className={`text-xl font-semibold text-gray-900 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
            Chat with Yamu Bot
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-10 flex flex-col h-[calc(100vh-64px)]">
        {/* Welcome Section - Centered */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-white shadow-sm mb-4 rounded-lg">
          <img
            src={botImage}
            alt="Yamu Bot"
            className="w-24 h-auto shadow-lg transform hover:scale-105 transition-transform duration-300 filter drop-shadow-2xl"
          />
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Travel Assistant</h2>
            <p className="text-gray-600">
              I am happy to offer you recommendations for your travels
            </p>
          </div>
        </div>

        {/* Chat Container - Maximized */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <BotChat />
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;