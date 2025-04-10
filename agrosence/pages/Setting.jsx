import React, { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import Layout from "../components/dashboard/Layout";
import axios from "axios";
import { resource } from "../resource";

const Settings = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    dob: "",
    presentAddress: "",
    permanentAddress: "",
    city: "",
    pinCode: "",
    country: "",
    profilePic: "", // For profile picture
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.error("No auth token or user ID found");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: response.data.name,
          username: response.data.username,
          email: response.data.email,
          password: "", 
          language:response.data.language,
          state:response.data.state,
          address:response.data.address,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload (optional)
  const handleFileChange = (e) => {
    setUser({ ...user, profilePic: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("No auth token or user ID found");
        return;
      }

      const updatedUser = { ...user };
      delete updatedUser.password; // Do not send empty password if not changing it

      await axios.put(`http://localhost:5000/api/auth/users/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <Layout>
      <div className="d-flex">
        <div className="flex-grow-1 overflow-auto">
          <div className="p-4">
            <h2 className="mb-4">Settings</h2>
            <div className="container border bg-white rounded-3 p-4">
              <h5 className="text-success mb-4" style={{ textDecoration: "underline" }}>
                Edit Profile
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Profile Image Upload */}
                  <div className="col-12 col-md-3 mb-4 mb-md-0">
                    <div className="position-relative d-inline-block">
                      <img
                        src={resource.Logo3.src || "/default-profile.jpg"} // Fallback image
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="col-12 col-md-9">
                    <div className="row g-4">
                      {[
                        { label: "Your Name", name: "name", type: "text" },
                        { label: "User Name", name: "username", type: "text" },
                        { label: "Email", name: "email", type: "email" },
                        { label: "Language", name: "language", type: "text" },
                        { label: "State", name: "state", type: "text" },
                        { label: "Address", name: "address", type: "text" },
                        { label: "Password", name: "password", type: "password", placeholder: "Leave blank to keep the same" },
                        ].map((field, index) => (
                        <div key={index} className="col-sm-6">
                          <label className="form-label">{field.label}</label>
                          <input
                            type={field.type}
                            name={field.name}
                            className="form-control"
                            value={user[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder || ""}
                          />
                        </div>
                      ))}

                      {/* Save Button */}
                      <div className="col-12 text-end">
                        <button type="submit" className="btn btn-success px-4">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
