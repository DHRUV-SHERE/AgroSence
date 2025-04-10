import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { resource } from "../resource"

const ProfileModal = ({ onClose }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const userId = localStorage.getItem("userId"); // ✅ Get stored userId
        
                if (!token || !userId) {
                    console.error("No auth token or user ID found");
                    return;
                }
        
                const response = await axios.get(`http://localhost:5000/api/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                setUser(response.data); // ✅ Set user data
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };        
        fetchUserProfile();
    }, []);

    if (!user) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal">
                {/* Header */}
                <div className="profile-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img
                            src={resource.Logo3.src} // Placeholder Image
                            alt="User"
                            className="rounded-circle me-2"
                            style={{ width: "50px", height: "50px" }}
                        />
                        <div>
                            <h5 className="mb-0">{user.name}</h5>
                            <p className="text-muted mb-0">{user.email}</p>
                        </div>
                    </div>
                    <FaTimes
                        className="close-icon"
                        onClick={onClose}
                        style={{ cursor: "pointer" }}
                    />
                </div>

                {/* Profile Details */}
                <div className="profile-body">
                    <div className="mb-3">
                        <span className="text-muted">Name</span>
                        <p className="mb-0">{user.name}</p>
                    </div>
                    <div className="mb-3">
                        <span className="text-muted">Email</span>
                        <p className="mb-0">{user.email}</p>
                    </div>
                    <div className="mb-3">
                        <span className="text-muted">Mobile Number</span>
                        <p className="mb-0">{user.mobile}</p>
                    </div>
                    <div className="mb-3">
                        <span className="text-muted">Location</span>
                        <p className="mb-0">{user.state}</p>
                    </div>
                </div>

                {/* Update Button */}
                <div className="profile-button d-flex justify-content-evenly">
                <button className="btn btn-success w-auto">
                    <a href="/Setting" style={{ textDecoration: "none", color: "white" }}>
                        Update
                    </a>
                </button>
                <button className="btn btn-success w-auto">
                    <a href="/" style={{ textDecoration: "none", color: "white" }}>
                        Logout
                    </a>
                </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
