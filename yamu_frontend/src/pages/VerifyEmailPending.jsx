import { Link } from "react-router-dom";

const VerifyEmailPending = () => {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>📩 Verify Your Email</h2>
      <p>We’ve sent a verification link to your email address.</p>
      <p>Please check your inbox and click the link to activate your account.</p>
      <p>If you didn’t receive an email, check your spam or junk folder.</p>
      <p style={{ marginTop: "1rem" }}>
        Already verified? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default VerifyEmailPending;
