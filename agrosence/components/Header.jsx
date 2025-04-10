import React, { useState } from "react";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { resource } from "../resource";
import ProfileModal from "../components/ProfileModel";
import "../src/App.css";

function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();

    if (query.includes("home")) navigate("/Home");
    else if (query.includes("about")) navigate("/About");
    else if (query.includes("contact")) navigate("/ContactUs");
    else if (query.includes("feature") || query.includes("features")) navigate("/Feature");
    else if (query.includes("dashboard")) navigate("/dashboard");
    else if (query.includes("government")) navigate("/features/government-schemes");
    else if (query.includes("market")) navigate("/features/MarketAccess");
    else if (query.includes("expert")) navigate("/features/expert");
    else if (query.includes("resource")) navigate("/features/resources");
    else if (query.includes("setting")) navigate("/Setting");
    else if (query.includes("support")) navigate("/QuickSupport");
    else if (query.includes("report")) navigate("/Reports");
    else if (query.includes("routine")) navigate("/Routine");
    else if (query.includes("sell")) navigate("/CropSell");
    else if (query.includes("product")) navigate("/product");
    else if (query.includes("order")) navigate("/OrderHistory");
    else alert("No matching page found!");

    setSearchQuery("");
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-md shadow-sm text-light w-100 fixed-top"
        style={{
          overflowX: "hidden",
          position: "static",
          backgroundColor: "#252525",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="container-fluid px-4">
          {/* Logo Section */}
          <a className="navbar-brand d-flex align-items-center p-1" href="/">
            <img
              src={resource.Logo2.src}
              alt={resource.Logo2.alt}
              className="rounded-circle me-2"
              style={{ width: "50px", height: "auto" }}
            />
            <h4 className="logoname mb-0 text-light">
              <b>AgroSense</b>
            </h4>
          </a>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler text-white bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto gap-3">
              {["Home", "Feature", "Dashboard", "Contact Us", "About"].map((item) => (
                <li className="nav-item fs-5" key={item}>
                  <a
                    className="nav-link position-relative text-light"
                    href={`/${item.replace(/\s+/g, "")}`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Search Bar and User Profile */}
            <div className="d-flex align-items-center">
              {/* User Profile Icon */}
              <FaUserCircle
                className="me-3 rounded-circle"
                style={{ fontSize: "2.5rem", cursor: "pointer" }}
                onClick={() => setShowProfile(true)}
              />

              {/* Search Bar */}
              <form className="d-flex align-items-center" onSubmit={handleSearch}>
                <div className="input-group" style={{ width: "250px" }}>
                  <span
                    className="input-group-text text-muted fs-5"
                    id="search-icon"
                    style={{
                      backgroundColor: "#F2F4F8",
                      borderTopLeftRadius: "25px",
                      borderBottomLeftRadius: "25px",
                      border: "1px solid #ccc",
                      borderRight: "none",
                      padding: "8px",
                    }}
                  >
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search (e.g. Report, Market)"
                    aria-label="Search"
                    aria-describedby="search-icon"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      backgroundColor: "#F2F4F8",
                      borderTopRightRadius: "25px",
                      borderBottomRightRadius: "25px",
                      border: "1px solid #ccc",
                      borderLeft: "none",
                      padding: "8px 12px",
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}

export default Header;
