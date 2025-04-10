import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col, Modal, Badge, Alert } from "react-bootstrap";
import axios from "axios";

const MarketAccess = () => {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCrops();
    fetchUser();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/crops");
      setCrops(response.data);
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

  const fetchUser = async () => {
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
      console.error("Error fetching user profile:", error);
    }
  };

  const handleShowModal = (crop) => {
    setSelectedCrop(crop);
    setShowModal(true);
  };

  const handleBuyNow = async () => {
    if (!user) {
      setNotification("You must be logged in to buy crops.");
      return;
    }

    setNotification("");

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          sellerId: selectedCrop.userId._id,
          buyerId: user._id,
          cropId: selectedCrop._id,
          quantity: 1,
          totalPrice: selectedCrop.cropSellingPrice,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      setNotification("Order placed! The seller has been notified.");
      setShowModal(false);
    } catch (error) {
      console.error("Error placing order:", error);
      setNotification("Failed to place order. Please try again.");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Available Crops</h2>
      {notification && <Alert variant="info">{notification}</Alert>}

      <Row className="g-4">
        {crops.map((crop) => (
          <Col md={4} key={crop._id}>
            <Card className="shadow-sm border-0">
              <Card.Img
                variant="top"
                src={crop.cropImages?.[0] || "/placeholder.png"} // Use Cloudinary URL directly
                alt={crop.cropName}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{crop.cropName}</Card.Title>
                <Badge bg="success">{crop.cropCategory}</Badge>
                <p className="text-muted mt-2">₹{crop.cropSellingPrice}/{crop.cropUnit}</p>
                <Button variant="primary" onClick={() => handleShowModal(crop)}>
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Crop Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCrop?.cropName} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCrop && (
            <Row>
              {/* Crop Image */}
              <Col md={6}>
                <img
                  src={selectedCrop.cropImages?.[0] || "/placeholder.png"}
                  alt={selectedCrop.cropName}
                  className="img-fluid rounded"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                />
              </Col>

              {/* Crop Details */}
              <Col md={6}>
                <h4 className="text-success">
                  ₹{selectedCrop.cropSellingPrice}/{selectedCrop.cropUnit}
                </h4>
                <p><strong>Category:</strong> {selectedCrop.cropCategory}</p>
                <p><strong>Description:</strong> {selectedCrop.cropDescription}</p>
                <p><strong>Quantity:</strong> {selectedCrop.cropQuantity} {selectedCrop.cropUnit}</p>
                <p>
                  <strong>Grown Organically:</strong>{" "}
                  {selectedCrop.grownOrganically === "true" ? "✅ Yes" : "❌ No"}
                </p>
                <p><strong>Crop Status:</strong> {selectedCrop.cropStatus || "Available"}</p>
                <p><strong>Crop ID:</strong> {selectedCrop._id}</p>
              </Col>
            </Row>
          )}

          {/* Seller Details */}
          {selectedCrop?.userId && (
            <Card className="mt-4 p-3 bg-light">
              <h5>Seller Information</h5>
              <p><strong>Name:</strong> {selectedCrop.userId.name}</p>
              <p><strong>Mobile:</strong> {selectedCrop.userId.mobile}</p>
              <p><strong>Location:</strong> {selectedCrop.userId.state}</p>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleBuyNow}
            disabled={
              user?._id === selectedCrop?.userId?._id || selectedCrop?.cropStatus === "Not Available"
            }
          >
            Buy Now
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MarketAccess;
