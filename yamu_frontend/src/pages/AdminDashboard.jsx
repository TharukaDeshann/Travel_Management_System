
import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';
import { Layout } from '../components/Layout.jsx';
import { fetchLoggedInUser } from "../services/authService";






export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchLoggedInUser();
        setCurrentUser(user);
        
        if (user?.id) {
          const response = await apiClient.get(`/api/reviews/guide/${user.id}`);
          console.log('Reviews:', response.data);
          setReviews(response.data);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  return (
    <Layout 
      user={currentUser} 
      unreadCount={0} // You can pass actual unread count from your state
      onCurrencyChange={() => {}} // Add currency change handler if needed
      selectedCurrency="LKR" // Set default currency
    >

    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
        <p>Here you can manage users, view reports, and perform administrative tasks.</p>

    </div>
    </Layout>
  );
}