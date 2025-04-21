import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying...");
  const [showResend, setShowResend] = useState(false);

  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:8080/api/auth/verify-email?token=${token}`)
        .then(() => {
          setStatus("success");
          setMessage("✅ Email verified successfully! Redirecting to login...");

          setTimeout(() => {
            navigate("/login");
          }, 3000); // Redirect after 3 seconds
        })
        .catch((err) => {
          setStatus("error");
          if (err.response?.data?.message) {
            setMessage("❌ " + err.response.data.message);
          } else {
            setMessage("❌ Something went wrong.");
          }

          setShowResend(true);
        });
    } else {
      setStatus("error");
      setMessage("❌ No verification token provided.");
    }
  }, [token, navigate]);

  const handleResendEmail = () => {
    axios
      .post("http://localhost:8080/api/auth/resend-verification", {
        token: token,
      })
      .then(() => {
        alert("📩 Verification email resent! Check your inbox.");
        setShowResend(false);
      })
      .catch(() => {
        alert("❌ Failed to resend verification email.");
      });
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Email Verification</h2>
      {status === "loading" && <p>⏳ Verifying your email...</p>}
      {status !== "loading" && <p>{message}</p>}

      {showResend && (
        <button
          onClick={handleResendEmail}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Resend Verification Email
        </button>
      )}
    </div>
  );
};

export default VerifyEmail;
