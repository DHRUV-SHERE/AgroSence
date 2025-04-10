import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/contact/submit", formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row g-5 align-items-start">
        <div className="col-md-6 ">
          {submitted ? (
            <motion.div
              className="text-center p-4 bg-light rounded shadow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="text-success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  height="100"
                  fill="currentColor"
                  className="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-4.97-2.97a.75.75 0 0 0-1.08 0L7.5 7.44l-1.47-1.47a.75.75 0 0 0-1.08 1.06l2 2a.75.75 0 0 0 1.08 0l4-4a.75.75 0 0 0 0-1.06z" />
                </svg>
              </motion.div>
              <h2 className="mt-3">Successfully Sent!</h2>
              <p>Thank you for reaching out. We will get back to you soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-12">
                  <h2 className="fw-bold mb-3">📩 Contact Us</h2>
                  <p className="text-muted mb-4 fs-5">
                    We would love to hear from you! Please fill out the form below and we will get back to you as soon as possible.
                  </p>
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter your name"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="mobile" className="form-label fw-bold">
                    Mobile no
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="mobile"
                    placeholder="Enter your mobile number"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="address" className="form-label fw-bold">
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="Enter your address"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="message" className="form-label fw-bold">
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="4"
                    placeholder="Enter your message"
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="col-12 text-center">
                  <button
                    type="submit"
                    className="btn btn-dark px-4 py-2 mt-2"
                    style={{ borderRadius: "10px" }}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Response"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column - Map & Contact Info */}
        <div className="col-md-6">
          <div className="bg-light p-4 rounded shadow">
            <h4 className="fw-bold mb-3">📍 Contact Information</h4>

            <p className="mb-2">
              <strong>Office Location:</strong>
              <br />
              U.V. Patel College of Engineering, Ganpat University,
              <br />
              Kherva, Gujarat
            </p>

            <p className="mb-2">
              <strong>Phone:</strong>
              <br />
              +91 93168 46548 (Project Management)<br />
              +91 90238 97448 (Query Management)<br />
              +91 70435 69445 (Interface Management)<br />
            </p>
            <p className="mb-2">
              <strong>Email:</strong>
              <br />
              <a
                href="mailto:projectagrosence2024@gmail.com"
                className="text-decoration-none"
              >
                projectagrosence2024@gmail.com <br />
                {/* sheredhruv@gmail.com <br />
                herin7151@gmail.com <br />
                janijeet50@gmail.com <br /> */}
              </a>
            </p>

            <p className="mb-4">
              <strong>Office Hours:</strong>
              <br />
              Monday - Friday: 9:00 AM - 5:00 PM
              <br />
              Saturday: 10:00 AM - 2:00 PM
            </p>

            <h5 className="fw-bold mb-3">📌 Our Location on Map</h5>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.115154878245!2d72.45628241101491!3d23.528360297175755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c476dcc7fad61%3A0x1cf6e21d7ca9091d!2sU.%20V.%20Patel%20College%20of%20Engineering%20(Main%20Building)!5e0!3m2!1sen!2sin!4v1744093555361!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ganpat University Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
