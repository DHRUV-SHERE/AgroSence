import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { BsBell, BsList } from "react-icons/bs";
import ProfileModal from "../../components/ProfileModel";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.error("No auth token or user ID found");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/auth/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || !user._id) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error.response?.data || error.message
      );
    }
  };

  const handleRemoveNotification = async (notificationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to accept this request?"
    );

    if (!confirmDelete) return;

    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/update`,
        { status: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );

      navigate("/Reports");
    } catch (error) {
      console.error(
        "Error updating notification:",
        error.response?.data || error.message
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();

    if (query.includes("report")) {
      navigate("/Reports");
    } else if (query.includes("profile")) {
      navigate("/Setting");
    } else if (query.includes("history")) {
      navigate("/OrderHistory");
    } else if (query.includes("sell")) {
      navigate("/CropSell");
    } else if (query.includes("bookmark")) {
      navigate("/Bookmarks");
    } else if (query.includes("routine")) {
      navigate("/Routine");
    } else if (query.includes("dash")) {
      navigate("/Dashboard");
    } else if (query.includes("home")) {
      navigate("/Home");
    } else if (query.includes("about")) {
      navigate("/About");
    } else if (query.includes("contact")) {
      navigate("/ContactUs");
    } else if (query.includes("feature") || query.includes("features")) {
      navigate("/Feature");
    } else if (query.includes("government")) {
      navigate("/features/government-schemes");
    } else if (query.includes("market")) {
      navigate("/features/MarketAccess");
    } else if (query.includes("expert")) {
      navigate("/features/expert");
    } else if (query.includes("resource")) {
      navigate("/features/resources");
    } else if (query.includes("support")) {
      navigate("/QuickSupport");
    } else if (query.includes("product")) {
      navigate("/product");
    } else if (query.includes("order")) {
      navigate("/OrderHistory");
    } else {
      alert("No matching route found!");
    }

    setSearchQuery("");
  };

  return (
    <>
      <div className="header bg-white border-bottom p-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            {/* Sidebar Toggle for Mobile */}
            <div className="col-auto d-flex align-items-center">
              {/* Search Form */}
              <form
                className="d-none d-lg-flex align-items-center"
                onSubmit={handleSearch}
              >
                <div className="input-group" style={{ maxWidth: "400px" }}>
                  <span
                    className="input-group-text text-muted fs-5"
                    style={{
                      backgroundColor: "#F2F4F8",
                      borderTopLeftRadius: "25px",
                      borderBottomLeftRadius: "25px",
                      border: "1px solid #ccc",
                      borderRight: "none",
                    }}
                  >
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search (e.g., Report, Profile)"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      backgroundColor: "#F2F4F8",
                      borderTopRightRadius: "25px",
                      borderBottomRightRadius: "25px",
                      border: "1px solid #ccc",
                      borderLeft: "none",
                    }}
                  />
                </div>
              </form>
            </div>

            {/* Right-side Icons */}
            <div className="col d-flex justify-content-end align-items-center">
              {/* Notifications */}
              <div className="position-relative me-3">
                <BsBell
                  className="text-muted fs-5"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ cursor: "pointer" }}
                />
                {notifications.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                )}
              </div>

              {/* User Icon */}
              <FaUserCircle
                className="me-2 rounded-circle"
                style={{ fontSize: "2.5rem", cursor: "pointer" }}
                onClick={() => setShowProfile(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      {showNotifications && (
        <div className="notification-popup">
          <div className="popup-content">
            <h5>Notifications</h5>
            {notifications.map((notification) => (
              <div key={notification._id} className="notification-item">
                <p>{notification.message}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/Reports")}
                >
                  View Report
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveNotification(notification._id)}
                >
                  Close
                </button>
              </div>
            ))}
            <button
              className="btn btn-secondary mt-2"
              onClick={() => setShowNotifications(false)}
            >
              Close All
            </button>
          </div>
        </div>
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* Popup Styles */}
      <style>{`
        .notification-popup {
          position: fixed;
          top: 60px;
          right: 20px;
          background: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 300px;
          border-radius: 10px;
          z-index: 1000;
        }
        .popup-content {
          padding: 15px;
        }
        .notification-item {
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }
      `}</style>
    </>
  );
};

export default Header;
