import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BsCheck2Square } from "react-icons/bs";
import loadingGif from "../src/assets/Chatbot2.gif";
import { resource } from "../resource";

const LoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          mobile: phone,
          password: password,
        }
      );

      if (response.status === 200) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        navigate("/Home");
      }
    } catch (error) {
      setErrorMessage("Invalid phone number or password.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url(${resource.Login.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width:"100vw", backgroundColor: "white" }} // Added white background
        >
          <img
            src={loadingGif}
            alt="Loading..."
            style={{ width: "350px", height: "350px" }}
          />
        </div>
      ) : (
        <div
          className="row w-100 shadow-lg bg-white  overflow-hidden"
          style={{ maxWidth: "900px", borderRadius: "30px" }}
        >
          <div className="col-md-6 p-5 d-flex flex-column align-items-start">
            <div className="flex justify-content-end align-item-end items-bottom mb-5 fw-bolder">
              <img
                src={resource.Logo4.src}
                alt="AgroSence Logo"
                style={{ width: "80px" }}
              />
              <span className="fs-5 font-bold" style={{ fontFamily: "Martel" }}>
                AgroSense{" "}
              </span>
            </div>

            <h5
              className="text-left w-100 fw-bold"
              style={{ fontFamily: "Playfair Display", fontSize: "25px" }}
            >
              Welcome to <span className="text-success">AgroSence</span>
            </h5>
            <h3
              className="mb-4 fw-bold"
              style={{ fontFamily: "Playfair Display", fontSize: "50px" }}
            >
              Login
            </h3>
            {errorMessage && (
              <p className="text-danger text-center">{errorMessage}</p>
            )}
            <form
              onSubmit={handleLogin}
              className="w-100"
              style={{ maxWidth: "400px" }}
            >
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-success">
                  Forget Password?
                </Link>
              </div>
              <button type="submit" className="btn btn-success w-100">
                Login
              </button>
              <p className="text-center mt-3 mb-5">
                Don't have an account?{" "}
                <Link to="/Signup" className="text-success">
                  Get Started
                </Link>
              </p>
            </form>
            <p className="text-center text-muted" style={{ fontSize: "14px" }}>
              © {new Date().getFullYear()} AgroSense. All rights reserved.
            </p>
          </div>
          <div
            className="col-md-6 d-none d-md-block position-relative"
            style={{
              backgroundImage: `url(${resource.Register.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 w-100 text-start text-white p-3">
              <h6 className="text-center fs-5" style={{ fontFamily: "Martel" }}>
                "Farm the land, Feed the World" 🌍🌾
              </h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
