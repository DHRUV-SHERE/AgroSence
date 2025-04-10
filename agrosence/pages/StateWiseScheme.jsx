import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resource } from "../resource";

const StateSchemes = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/schemes/all`);
        const filteredSchemes = response.data.data.filter(
          (scheme) => scheme.state.toLowerCase() === stateName.toLowerCase()
        );
        setSchemes(filteredSchemes);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch schemes. Please try again later.");
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [stateName]);

  return (
    <>
      <Header />
      
      <div
        className="d-flex align-items-center justify-content-center hero-section position-relative text-white text-center py-5"
        style={{
          backgroundImage: `url(${resource.GovBG.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          height: "400px",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        ></div>
        <h1 className="text-white position-relative display-2 fw-bold">
          Government Schemes
        </h1>
      </div>

      <Container className="py-5">
        <h2 className="text-center mb-4">{stateName} Government Schemes</h2>
        <Button variant="primary" onClick={() => navigate(-1)} className="mb-4">
          Back to States
        </Button>

        {loading && <Spinner animation="border" className="d-block mx-auto" />} 
        {error && <p className="text-danger text-center">{error}</p>}

        {!loading && !error && schemes.length === 0 && (
          <p className="text-center text-muted">No schemes available for this state.</p>
        )}

        <Row xs={1} className="g-4">
          {schemes.map((scheme) => (
            <Col key={scheme._id}>
              <Card className="shadow-sm w-100 p-3">
                <Card.Body>
                  <p className="mb-2 fs-4 text-primary"><strong>Scheme Name:</strong> {scheme.name}</p>
                  <p className="mb-2"><strong>Description:</strong> {scheme.description}</p>
                  <p className="mb-2"><strong>Eligibility:</strong> {scheme.eligibility}</p>
                  <p className="mb-3"><strong>Benefits:</strong> {scheme.benefits}</p>
                  <Button variant="success" href={scheme.applyLink} target="_blank">
                    Apply Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default StateSchemes;
