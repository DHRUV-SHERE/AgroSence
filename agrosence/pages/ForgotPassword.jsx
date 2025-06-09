import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      const res = await axios.post("https://agrosence-1.onrender.com/api/auth/send-otp", { email });
      setMessage("OTP sent successfully.");
      setStep(2);
    } catch (err) {
      setMessage("Failed to send OTP.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("https://agrosence-1.onrender.com/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage("Password reset successful.");

      // Redirect to login page after 2 seconds delay (optional)
      setTimeout(() => {
        navigate("/Login");
      }, 2000);

    } catch (err) {
      setMessage("Invalid OTP or error updating password.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="bg-white p-5 shadow rounded" style={{ width: "400px" }}>
        <h4 className="mb-4">Forgot Password</h4>
        {message && <p className="text-info">{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-success w-100" onClick={handleSendOTP}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={handleResetPassword}>
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
