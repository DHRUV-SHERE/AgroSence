import React, { useState } from "react";
import api from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { resource } from "../resource"; 
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    address: "",
    language: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setMessage(""); // clear error on typing
  };

  const handleNext = () => {
    let isValid = true;
    let requiredFields = [];

    if (step === 1) {
      requiredFields = ["name", "mobile", "email"];
    } else if (step === 2) {
      requiredFields = ["password", "confirmPassword"];
      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }
    } else if (step === 3) {
      requiredFields = ["state", "address", "language"];
    }

    for (let field of requiredFields) {
      if (!formData[field]?.trim()) {
        setMessage(`Please fill in your ${field}`);
        isValid = false;
        break;
      }
    }

    if (isValid) {
      setMessage(""); // clear any existing messages
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const response = await api.post("/auth/signup", formData);
      setMessage(response.data.message);
      navigate("/Login"); // Redirect to login page on successful signup
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${resource.Login.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="row shadow overflow-hidden bg-white"
        style={{ height: "80vh", width: "60vw", borderRadius: "30px" }}
      >
        <div
          className="col-md-6 d-none d-md-block position-relative p-0"
          style={{
            height: "auto",
            backgroundImage: `url(${resource.Register.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid lightgray",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
          }}
        >
          <h2
            className="fs-4 fw-bold text-center p-2 position-absolute w-100"
            style={{
              bottom: "0",
              borderBottomLeftRadius: "10px",
              fontFamily: "martel",
              color: "white",
            }}
          >
            "Join us and grow your farm!" 🌿🚜
          </h2>
        </div>

        <div
          className="col-md-6 bg-white p-4 d-flex flex-column justify-content-center"
          style={{
            border: "1px solid lightgray",
            borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
          }}
        >
          <h2 className="text-center">Sign Up</h2>
          <p className="text-center text-muted fs-5">
            Enter your details to create a new account
          </p>
          {message && <p className="text-center text-info">{message}</p>}
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                {["name", "mobile", "email"].map((field) => (
                  <div className="mb-2" key={field}>
                    <label htmlFor={field} className="form-label fs-6">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      id={field}
                      className="form-control fs-6"
                      placeholder={`Enter your ${field}`}
                      value={formData[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn w-100 mt-2"
                  onClick={handleNext}
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {["password", "confirmPassword"].map((field) => (
                  <div className="mb-2" key={field}>
                    <label htmlFor={field} className="form-label fs-6">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="password"
                      id={field}
                      className="form-control fs-6"
                      placeholder={`Enter your ${field}`}
                      value={formData[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn w-100 mt-2"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn w-100 mt-2"
                  onClick={handleNext}
                >
                  Next
                </button>
              </>
            )}

            {step === 3 && (
              <>
                {["state", "address"].map((field) => (
                  <div className="mb-2" key={field}>
                    <label htmlFor={field} className="form-label fs-6">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      id={field}
                      className="form-control fs-6"
                      placeholder={`Enter your ${field}`}
                      value={formData[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                <div className="mb-2">
                  <label htmlFor="language" className="form-label fs-6">
                    Language
                  </label>
                  <select
                    id="language"
                    className="form-control fs-6"
                    value={formData.language}
                    onChange={handleChange}
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn w-100 mt-2"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn w-100 mt-2"
                  style={{ backgroundColor: "#34a853", color: "white" }}
                >
                  Sign Up
                </button>
              </>
            )}
          </form>
          <div className="text-center mt-3">
            <span className="text-muted">Already have an account?</span>{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/Login")}
              style={{ textDecoration: "none", fontWeight: "bold" }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
