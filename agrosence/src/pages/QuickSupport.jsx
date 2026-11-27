import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import Layout from "../components/dashboard/Layout";

const QuickSupport = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5000/api/support", formData, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("Response:", response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  
    setLoading(false);
  };
  

  return (
    <Layout>
      <Container className="py-5">
        <h2 className="text-center mb-4">Quick Support</h2>
        <Row className="d-flex justify-content-between">
          {/* Support Form */}
          <Col md={6}>
            <Card className="shadow-lg p-4">
              <h4 className="text-center mb-3">Need Help? Contact Us!</h4>
              <p className="text-muted text-center">We are here to assist you 24/7.</p>
              {submitted ? (
                <Alert variant="success" className="text-center">
                  ✅ Your message has been sent successfully!
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      placeholder="Describe your issue"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  {error && <Alert variant="danger">❌ {error}</Alert>}
                  <div className="d-grid">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
                    </Button>
                  </div>
                </Form>
              )}
            </Card>
          </Col>
          {/* Contact Details */}
          <Col md={5}>
            <Card className="shadow p-4 h-auto">
              <h4 className="text-center mb-3">📞 Contact Information</h4>
              <h5>📞 Toll-Free Number:</h5>
              <p className="fw-bold text-primary">1800-123-4567</p>
              <h5>📧 Email Support:</h5>
              <p className="fw-bold text-success">projectagrosense2024@gmail.com</p>
              <h5>📍 Address:</h5>
              <p className="text-muted">
                U.V. Patel College of Engineering - Ganpat University, Kherva, Mehsana, Gujarat
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default QuickSupport;