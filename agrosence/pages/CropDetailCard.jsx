import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Badge, Row, Col } from "react-bootstrap";
import axios from "axios";

const CropDetail = () => {
  const { id } = useParams(); // Get crop ID from URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/crops/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Container className="py-4 w-50">
      <Card className="shadow-lg border-0">
        <Row className="g-4">
          {/* Crop Image */}
          <Col md={6} className="d-flex align-items-center">
            <img
              src={product.cropImages?.[0] ? `http://localhost:5000${product.cropImages[0]}` : "/placeholder.png"}
              alt={product.cropName || "Crop Image"}
              className="img-fluid rounded"
              style={{ maxHeight: "350px", objectFit: "cover" }}
            />
          </Col>

          {/* Crop Details */}
          <Col md={6}>
            <Card.Body>
              <h2 className="h3">{product.cropName}</h2>
              <Badge bg="success" className="mb-3">{product.cropCategory || "Uncategorized"}</Badge>

              <p className="text-muted">{product.cropDescription || "No description available."}</p>

              <h4 className="text-success">
                ₹{Number(product.cropSellingPrice || 0).toFixed(2)}
                <span className="text-muted fs-6">/{product.cropUnit}</span>
              </h4>

              <p><strong>Quantity:</strong> {product.cropQuantity} {product.cropUnit}</p>
              <p><strong>Grown Organically:</strong> {product.grownOrganically === "Yes" ? "✅ Yes" : "❌ No"}</p>
              <p><strong>Crop Status:</strong> {product.cropStatus || "Available"}</p>
              <p><strong>Crop ID:</strong> {product.cropId}</p>
            </Card.Body>
          </Col>
        </Row>

        {/* Seller Information */}
        <Card.Footer className="bg-light">
          <h5 className="mb-3">Seller Information</h5>
          <p><strong>Name:</strong> {product.userId?.name || "Unknown"}</p>
          <p><strong>Mobile:</strong> {product.userId?.mobile || "Not provided"}</p>
          <p><strong>Location:</strong> {product.userId?.state || "Unknown"}</p>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default CropDetail;
