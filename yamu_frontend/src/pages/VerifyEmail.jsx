import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader, Mail, RefreshCw } from "lucide-react";
import useNotification from "../hooks/useNotification";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [showResend, setShowResend] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    // Prevent multiple API calls
    if (!token || status !== "loading") {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided in the URL.");
        showError("❌ No verification token found.");
      }
      return;
    }

    let countdownInterval;
    let timeoutId;

    timeoutId = setTimeout(() => {
      axios
        .get(`http://localhost:8080/api/auth/verify-email?token=${token}`)
        .then((response) => {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          showSuccess("✅ Email verified successfully!");

          // Start countdown
          countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                navigate("/login");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        })
        .catch((error) => {
          console.error("Verification error:", error);
          setStatus("error");
          setShowResend(true);

          // Better error messaging
          if (error.response?.status === 400) {
            setMessage("Invalid or expired verification token.");
            showError("❌ Invalid or expired verification token.");
          } else if (error.response?.status === 404) {
            setMessage("Verification service not available.");
            showError("❌ Verification service not available.");
          } else if (error.response?.data?.message) {
            setMessage(error.response.data.message);
            showError(`❌ ${error.response.data.message}`);
          } else {
            setMessage("Unable to verify email. Please try again.");
            showError("❌ Unable to verify email. Please try again.");
          }
        });
    }, 500);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [token]);

  const handleResendEmail = () => {
    axios
      .post("http://localhost:8080/api/auth/resend-verification", {
        token: token,
      })
      .then(() => {
        showSuccess("✅ Verification email resent successfully!");
        setShowResend(false);
      })
      .catch(() => {
        showError(
          "❌ Failed to resend verification email. Please try again later."
        );
        setShowResend(true);
      });
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader className="w-16 h-16 text-white animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-white" />;
      case "error":
        return <XCircle className="w-16 h-16 text-white" />;
      default:
        return <Mail className="w-16 h-16 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "linear-gradient(135deg, #5B1B15 0%, #D59C29 100%)";
      case "success":
        return "linear-gradient(135deg, #059669 0%, #10B981 100%)";
      case "error":
        return "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)";
      default:
        return "linear-gradient(135deg, #5B1B15 0%, #D59C29 100%)";
    }
  };

  return (
    // #5B1B15
    <div className="min-h-screen" style={{ backgroundColor: "#f0f2f5" }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with dynamic gradient */}
          <div
            className="px-8 py-12 text-center text-white relative"
            style={{ background: getStatusColor() }}
          >
            <div className="relative z-10">
              <div className="bg-white bg-opacity-20 rounded-full p-4 inline-block mb-4">
                {getStatusIcon()}
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verification</h2>
              <p className="text-white text-opacity-90">
                {status === "loading" && "Processing verification..."}
                {status === "success" && "Verification complete!"}
                {status === "error" && "Verification failed"}
              </p>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {status === "loading" && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: "#D59C29" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: "#D59C29",
                        animationDelay: "0.2s",
                      }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: "#D59C29",
                        animationDelay: "0.4s",
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-gray-600">{message}</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <p className="text-gray-700 mb-4">{message}</p>
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <span className="text-gray-600">Redirecting in</span>
                  <span
                    className="text-2xl font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: "#059669" }}
                  >
                    {countdown}
                  </span>
                  <span className="text-gray-600">seconds</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      backgroundColor: "#059669",
                      width: `${((3 - countdown) / 3) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <p className="text-gray-700 mb-6">{message}</p>

                {showResend ? (
                  <button
                    onClick={handleResendEmail}
                    className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: "#5B1B15",
                      boxShadow: "0 4px 15px rgba(91, 27, 21, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#7A2419";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#5B1B15";
                    }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Resend Verification Email</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending email...</span>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Need help? Contact support at{" "}
                    <a
                      href="mailto:support@yourcompany.com"
                      className="font-semibold hover:underline"
                      style={{ color: "#D59C29" }}
                    >
                      support@yamutravel.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
