import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import useNotification from '../hooks/useNotification';
import { useNavigate } from 'react-router-dom';
const VerifyEmailPending = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div 
            className="px-8 py-12 text-center text-white relative"
            style={{ 
              background: `linear-gradient(135deg, #5B1B15 0%, #7A2419 50%, #D59C29 100%)` 
            }}
          >
            <div className="relative z-10">
              <div className="bg-white bg-opacity-20 rounded-full p-4 inline-block mb-4">
                <Mail className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-white text-opacity-90">Verification link sent!</p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: '#D59C29' }}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 flex-1">
                  We've sent a verification link to your email address.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: '#D59C29' }}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 flex-1">
                  Click the link in your email to activate your account.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: '#D59C29' }}
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 flex-1">
                  Don't see the email? Check your spam or junk folder.
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Already verified your email?</p>
              <button
                onClick={handleLoginClick}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#5B1B15',
                  boxShadow: '0 4px 15px rgba(91, 27, 21, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#7A2419';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#5B1B15';
                }}
              >
                Login Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPending;