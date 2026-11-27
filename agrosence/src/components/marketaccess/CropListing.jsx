import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { FiUpload, FiCheckCircle } from "react-icons/fi";
import axios from "axios";

const CropListingForm = () => {
  const [cropName, setCropName] = useState("");
  const [cropDescription, setCropDescription] = useState("");
  const [cropCategory, setCropCategory] = useState("");
  const [cropSellingPrice, setCropSellingPrice] = useState("");
  const [cropUnit, setCropUnit] = useState("kg");
  const [cropQuantity, setCropQuantity] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [images, setImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      alert("You can only upload a maximum of 4 images");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("User not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("cropName", cropName);
    formData.append("cropDescription", cropDescription);
    formData.append("cropCategory", cropCategory);
    formData.append("cropSellingPrice", cropSellingPrice);
    formData.append("cropUnit", cropUnit);
    formData.append("cropQuantity", cropQuantity);
    formData.append("grownOrganically", isOrganic ? "true" : "false");
    formData.append("userId", userId);

    images.forEach((img) => formData.append("cropImages", img.file));

    try {
      const response = await fetch("http://localhost:5000/api/crops/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 2000); // Hide message after 2 seconds

        // Reset form fields
        setCropName("");
        setCropDescription("");
        setCropCategory("");
        setCropSellingPrice("");
        setCropUnit("kg");
        setCropQuantity("");
        setIsOrganic(false);
        setImages([]);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4">Create a New Crop Listing</h2>

      <Form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <Row className="mb-3">
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Crop Name</Form.Label>
              <Form.Control
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={cropCategory}
                onChange={(e) => setCropCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="herbs">Herbs</option>
                <option value="grains">Grains</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={cropDescription}
            onChange={(e) => setCropDescription(e.target.value)}
            placeholder="Describe your crop, quality, harvest date, etc."
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>₹</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={cropSellingPrice}
                  onChange={(e) => setCropSellingPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Unit</Form.Label>
              <Form.Select
                value={cropUnit}
                onChange={(e) => setCropUnit(e.target.value)}
                required
              >
                <option value="bunch">bunch</option>
                <option value="lb">lb</option>
                <option value="kg">kg</option>
                <option value="each">each</option>
                <option value="dozen">dozen</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Available Quantity</Form.Label>
              <Form.Control
                type="text"
                value={cropQuantity}
                onChange={(e) => setCropQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Check
            type="switch"
            id="organic-switch"
            label="This crop is organically grown"
            checked={isOrganic}
            onChange={() => setIsOrganic(!isOrganic)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Upload Images (Max 4)</Form.Label>
          <div className="d-flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                style={{
                  width: "120px",
                  height: "120px",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img.preview || "/placeholder.svg"}
                  alt="Uploaded Image"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}

            {images.length < 4 && (
              <label
                style={{
                  width: "120px",
                  height: "120px",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#6c757d",
                }}
              >
                <FiUpload size={24} />
                <div className="mt-2">Add Images</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        </Form.Group>

        <Button type="submit" variant="success" className="px-4">
          Submit Listing
        </Button>
      </Form>

      {/* Success Message Modal */}
      <Modal
        show={successMessage}
        centered
        onHide={() => setSuccessMessage(false)}
      >
        <Modal.Body className="text-center p-4">
          <FiCheckCircle size={50} color="green" />
          <h4 className="mt-3">Successfully Added to Sell</h4>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CropListingForm;
