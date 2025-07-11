
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Layout } from "../components/Layout";
import apiClient from "../services/axiosInstance";
import { fetchLoggedInUser } from "../services/authService";

const GuideReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '24px',
            color: '#532321',
            marginBottom: '30px'
          }}>My Reviews</h2>
          
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      color: '#333'
                    }}>
                      {review.travelerName}
                    </h3>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          size={18}
                          fill={star <= review.rating ? '#FFD700' : 'none'}
                          color={star <= review.rating ? '#FFD700' : '#ddd'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{
                    margin: '10px 0',
                    color: '#555',
                    lineHeight: '1.5'
                  }}>
                    {review.comment}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#888',
                    margin: 0
                  }}>
                    Posted: {new Date(review.createdAt).toLocaleDateString()}
                    {review.updatedAt && (
                      <span> • Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default GuideReview;
