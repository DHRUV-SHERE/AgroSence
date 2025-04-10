import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaThumbsUp, FaTools, FaTags, FaGasPump, FaLink } from "react-icons/fa";

const ResourceDetail = () => {
  const { _id } = useParams(); // Get `_id` from the URL
  const [resource, setResource] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/resources/${_id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched resource:", data); // Debugging
        setResource(data);
      })
      .catch((err) => console.error("Error fetching resource:", err));
  }, [_id]);

  if (!resource) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Container className="py-5">
        {/* Name and Description */}
        <motion.h2
          className="fw-bold text-success text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {resource.name}
        </motion.h2>
        <motion.p
          className="text-center fw-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {resource.description}
        </motion.p>

        <Row className="g-4">
          {/* Left Column (Purpose & Advantage) */}
          <Col md={4}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-4 border-0 bg-transparent">
                <div className="d-flex">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaThumbsUp size={30} className="text-white" />
                    </div>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold">Purpose</h5>
                    <p className="fs-6 fw-medium text-muted">
                      {resource.purpose || "No data available"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="mb-4 border-0 bg-transparent">
                <div className="d-flex">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaTags size={30} className="text-white" />
                    </div>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold">Popular Brand</h5>
                    <p className="fs-6 fw-medium text-muted">
                      {resource.popularbrand || "No data available"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Center Column (Image) */}
          <Col
            md={4}
            className="d-flex align-items-center justify-content-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded-circle overflow-hidden"
                style={{ width: "300px", height: "300px" }}
              >
                <img
                  src={
                    resource.image
                      ? `http://localhost:5000${resource.image}`
                      : "/placeholder.svg"
                  }
                  alt={resource.name}
                  className="img-fluid w-100 h-100 object-fit-cover"
                />
              </div>
            </motion.div>
          </Col>

          {/* Right Column (Popular Brand & Link) */}
          <Col md={4}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-4 border-0 bg-transparent">
                <div className="d-flex">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaTools size={30} className="text-white" />
                    </div>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold">Advantages</h5>
                    <p className="fs-6 fw-medium text-muted">
                      {resource.advantages || "No data available"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="mb-4 border-0 bg-transparent">
                <div className="d-flex">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaLink size={30} className="text-white" />
                    </div>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold">Video Link for More Details</h5>
                    <p className="small fw-medium text-muted">
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.link || "No data available"}
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* How to Use (Full Width) */}
        <Row className="g-4 w-75 m-auto">
          <Col md={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-4 border-0 bg-transparent">
                <div className="d-flex">
                  <div className="me-3">
                    <div
                      className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <FaTags size={30} className="text-white" />
                    </div>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold">How to Use</h5>
                    <p className="fs-6 fw-medium text-muted">
                      {resource.howtouse || "No data available"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ResourceDetail;
