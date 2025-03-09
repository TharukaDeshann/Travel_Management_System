import React from "react";
import "../styles/GuideReview.css";
import yamuLogo from '../images/yamu-logo.png';

const GuideReview = () => {
  const reviews = [
    {
      id: 1,
      travelerName: "Devid Perera",
      rating: 4.5,
      comment: "Great experience with the guide!",
      date: "2024-03-15"
    },
    {
      id: 2,
      travelerName: "Govindu Bandara",
      rating: 5.0,
      comment: "Excellent service and very knowledgeable.",
      date: "2024-03-14"
    }
  ];

  return (
    <div className="guide-review">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={yamuLogo} alt="Yamu Logo" className="logo-image"/>
          <span>YAMU</span>
        </div>
        <div className="nav-links">
          <a href="/guide-dashboard">Dashboard</a>
          <a href="/guide-calendar">Calendar</a>
          <a href="#">Reviews</a>
          <a href="#">Emergency</a>
        </div>
      </nav>

      {/* Reviews Section */}
      <div className="content">
        <h2>My Reviews</h2>
        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <h3>{review.travelerName}</h3>
                <span className="rating">⭐ {review.rating}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <span className="review-date">{review.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideReview;
