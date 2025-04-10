import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaArrowUp,
} from "react-icons/fa";
import { resource } from "../resource";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="text-white py-5 w-100"
      style={{ backgroundColor: "#252525" }}
    >
      <div className="container">
        <div className="row">
          {/* About Us */}
          <div className="col-md-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img
                src={resource.Logo2.src}
                alt={resource.Logo2.alt}
                className="rounded-circle me-2"
                style={{ width: "50px", height: "auto" }}
              />
              <h5
                className="fw-bold logoname mt-auto"
                style={{ color: "#D1D1D1" }}
              >
                AgroSense
              </h5>
            </div>
            <p style={{ color: "#D1D1D1" }}>
              AgroSense is dedicated to revolutionizing agriculture with
              innovative technology, empowering farmers for a sustainable
              future.
            </p>
          </div>
          {/* Contact Info */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Contact Us</h6>
            <p>Email: projectagrosence2024@gmail.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Address: Ganpat University, Gujarat, India</p>
          </div>

          {/* Newsletter */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold">Newsletter</h6>
            <p>Subscribe to get the latest updates.</p>
            <form>
              <input
                type="email"
                placeholder="Your email"
                className="form-control mb-2"
                style={{
                  backgroundColor: "#333",
                  border: "none",
                  color: "white",
                }}
              />
              <button type="submit" className="btn btn-light w-100">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="row mb-3">
          <div className="col-12 text-center">
            <div
              className="d-flex justify-content-center align-items-center"
              onClick={scrollToTop}
              style={{
                cursor: "pointer",
                backgroundColor: "#333",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                margin: "0 auto 1rem auto",
              }}
            >
              <FaArrowUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="row mb-3">
          <div className="col-12 text-center">
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-white" title="Facebook">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-white" title="Twitter">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-white" title="Instagram">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-white" title="LinkedIn">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-3">
          <div className="col-12 text-center">
            <small>© 2025 Team AgroSense. All rights reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
