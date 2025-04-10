import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchemeCard from "../components/govscheme/SchemeCard";
import QuickReports from "../components/govscheme/QuickReport";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resource } from "../resource";

const GovSchemes = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // This part is already implemented
  const handleSchemeClick = (stateName) => {
    const formattedStateName = stateName.replace(/\b\w/g, (char) => char.toUpperCase());
    navigate(`/state-schemes/${formattedStateName}`);
  };
  

  // States data
  const states = [
    { name: "All States", mapUrl: `${resource.india.src}` },
    { name: "Andhra Pradesh", mapUrl: `${resource.AndhraPradesh.src}` },
    { name: "Arunachal Pradesh", mapUrl: `${resource.ArunachalPradesh.src}` },
    { name: "Assam", mapUrl: `${resource.Assam.src}` },
    { name: "Bihar", mapUrl: `${resource.Bihar.src}` },
    { name: "Chhattisgarh", mapUrl: `${resource.Chhattisgarh.src}` },
    { name: "Goa", mapUrl: `${resource.Goa.src}` },
    { name: "Gujarat", mapUrl: `${resource.Gujarat.src}` },
    { name: "Haryana", mapUrl: `${resource.Haryana.src}` },
    { name: "Himachal Pradesh", mapUrl: `${resource.HimachalPradesh.src}` },
    { name: "Jharkhand", mapUrl: `${resource.Jharkhand.src}` },
    { name: "Karnataka", mapUrl: `${resource.Karnataka.src}` },
    { name: "Kerala", mapUrl: `${resource.Kerala.src}` },
    { name: "Madhya Pradesh", mapUrl: `${resource.MadhyaPradesh.src}` },
    { name: "Maharashtra", mapUrl: `${resource.Maharashtra.src}` },
    { name: "Manipur", mapUrl: `${resource.Manipur.src}` },
    { name: "Meghalaya", mapUrl: `${resource.Meghalaya.src}` },
    { name: "Mizoram", mapUrl: `${resource.Mizoram.src}` },
    { name: "Nagaland", mapUrl: `${resource.Nagaland.src}` },
    { name: "Odisha", mapUrl: `${resource.Odisha.src}` },
    { name: "Punjab", mapUrl: `${resource.Punjab.src}` },
    { name: "Rajasthan", mapUrl: `${resource.Rajasthan.src}` },
    { name: "Sikkim", mapUrl: `${resource.Sikkim.src}` },
    { name: "Tamil Nadu", mapUrl: `${resource.TamilNadu.src}` },
    { name: "Telangana", mapUrl: `${resource.Telangana.src}` },
    { name: "Tripura", mapUrl: `${resource.Tripura.src}` },
    { name: "Uttar Pradesh", mapUrl: `${resource.UttarPradesh.src}` },
    { name: "Uttarakhand", mapUrl: `${resource.Uttarakhand.src}` },
    { name: "West Bengal", mapUrl: `${resource.WestBengal.src}` },
  ];

  // Filter states based on search query
  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Container className="py-4 ">
        <div className="text-center mb-4">
          <p className="lead">Access state-wise government schemes</p>

          {/* Search Box */}
          <Form.Control
            type="text"
            placeholder="Search states"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-50 mx-auto"
          />
        </div>
        <div className="backbtn w-100 d-flex justify-content-start align-items-center">
        <Button variant="primary" onClick={() => navigate(-1)} className="mb-4">
          Back to Features
        </Button>
      </div>
        <Row>
          <Col lg={9}>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredStates.map((state, index) => (
                <Col key={index}>
                  <SchemeCard
                    state={state.name}
                    imageUrl={state.mapUrl}
                    onClick={() =>
                      navigate(
                        `/state-schemes/${state.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
                  />
                </Col>
              ))}
            </Row>

            {filteredStates.length === 0 && (
              <p className="text-center text-muted">No states found</p>
            )}
          </Col>
          <Col lg={3}>
            <QuickReports />
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default GovSchemes;
