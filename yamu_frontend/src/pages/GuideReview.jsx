import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/axiosInstance";
import { fetchLoggedInUser } from "../services/authService";
import yamuLogo from '../images/yamu-logo.png';

const GuideReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          <img src={yamuLogo} alt="Yamu Logo" style={{ height: '40px' }} />
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#532321'
          }}>YAMU</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          {['Dashboard', 'Calendar', 'Reviews', 'Emergency Contacts'].map((item) => (
            <button
              key={item}
              style={{
                background: 'none',
                border: 'none',
                color: '#333',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '5px 10px',
                ':hover': {
                  color: '#532321'
                }
              }}
              onClick={() => navigate(`/guide-${item.toLowerCase().replace(' ', '-')}`)}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

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
  );
};

export default GuideReview;