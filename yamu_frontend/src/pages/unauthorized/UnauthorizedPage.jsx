import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
const UnauthorizedPage = () => {
  const currentUser = useUser().user;
  const navigate = useNavigate();
  const handleGoHome = () => {
    if(currentUser.role === 'ADMIN') {
        navigate('/admin-user-management');
    } else if(currentUser.role === 'TRAVELER') {
        navigate('/traveler-dashboard');
    } else if(currentUser.role === 'GUIDE') {
        navigate('/guide-dashboard');
    } else {
        navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-3); // Go back 3 pages in history
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          You don't have permission to access this page. Please contact your administrator 
          if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a 
              href="mailto:support@yourcompany.com" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              support@yamutravel.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;