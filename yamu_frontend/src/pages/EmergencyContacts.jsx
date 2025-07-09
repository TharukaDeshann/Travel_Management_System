import React from 'react';
import { Phone, AlertTriangle, MapPin, Clock, User, Shield, Heart, Car, Zap } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useUser } from '../context/UserContext';

const EmergencyContacts = () => {
  const user = useUser().user;
  const unreadCount = 0;

  const emergencyContacts = [
    { id: 1, category: 'police', name: 'Sri Lanka Police Emergency', number: '119', description: 'General police emergency hotline', available: '24/7', icon: Shield, color: 'bg-blue-500' },
    { id: 2, category: 'medical', name: 'Ambulance Service', number: '1990', description: 'National ambulance service', available: '24/7', icon: Heart, color: 'bg-red-500' },
    { id: 3, category: 'fire', name: 'Fire & Rescue', number: '011-2422222', description: 'Fire department emergency', available: '24/7', icon: AlertTriangle, color: 'bg-orange-500' },
    { id: 4, category: 'disaster', name: 'Disaster Management Centre', number: '117', description: 'Natural disaster emergency response', available: '24/7', icon: AlertTriangle, color: 'bg-yellow-500' },
    { id: 5, category: 'medical', name: 'National Hospital Colombo', number: '011-2691111', description: 'Main government hospital', available: '24/7', icon: Heart, color: 'bg-red-500' },
    { id: 6, category: 'police', name: 'Tourist Police', number: '011-2421052', description: 'Specialized police unit for tourists', available: '24/7', icon: Shield, color: 'bg-blue-500' },
    { id: 7, category: 'transport', name: 'Airport Emergency', number: '011-2252861', description: 'Bandaranaike International Airport', available: '24/7', icon: Car, color: 'bg-purple-500' },
    { id: 8, category: 'utilities', name: 'Ceylon Electricity Board', number: '1987', description: 'Power outage and electrical emergencies', available: '24/7', icon: Zap, color: 'bg-green-500' },
    { id: 9, category: 'medical', name: 'Poison Information Centre', number: '011-2686565', description: 'Poisoning and toxicology emergencies', available: '24/7', icon: Heart, color: 'bg-red-500' },
    { id: 10, category: 'other', name: 'Sri Lanka Tourism Hotline', number: '1912', description: 'Tourist assistance and information', available: '24/7', icon: User, color: 'bg-indigo-500' }
  ];

  const handleCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Layout
      user={user}
      unreadCount={unreadCount}
      selectedCurrency={'LKR'}
      onCurrencyChange={() => {}}
    >
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800">Emergency Contacts</h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Access the most important emergency numbers in Sri Lanka. These lines are open 24/7. Save or call them in times of need.
          </p>
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold">
              🚨 In life-threatening emergencies, call <strong>119</strong> (Police) or <strong>1990</strong> (Ambulance).
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {emergencyContacts.map(({ id, name, number, description, available, icon: Icon, color }) => (
            <div
              key={id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-200 p-6 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full ${color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-mono text-lg font-semibold text-gray-800">{number}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{available}</span>
                </div>

                <button
                  onClick={() => handleCall(number)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center mt-4"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Info
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              When calling, provide:
              <br />• District and city/town<br />• Landmark or address<br />• GPS coordinates (if known)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Tips During Emergency
            </h3>
            <p className="text-yellow-800 text-sm leading-relaxed">
              • Keep your phone charged<br />
              • Speak clearly and calmly<br />
              • Follow instructions from the operator<br />
              • Stay in a safe area when possible
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          Last updated: July 2025 | For non-emergencies, contact local stations
        </div>
      </div>
    </Layout>
  );
};

export default EmergencyContacts;
