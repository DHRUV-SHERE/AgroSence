import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Card,
  Badge,
  Button,
} from "react-bootstrap";
import { FiSearch, FiStar } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resource } from "../resource";

const AgriculturalExperts = () => {
  const experts = [
    {
      id: 1,
      name: "Dr. Gyanendra Pratap Singh",
      title: "Director, Indian Agricultural Research Institute (IARI)",
      image: "https://www.iari.res.in/images/gyanendra.jpg",
      rating: 4.9,
      reviews: 210,
      specialties: ["Plant Breeding", "Genetics"],
      email: "info@iari.res.in",
      phone: "011-25841670",
      address: "Pusa Campus, New Delhi – 110012",
    },
    {
      id: 2,
      name: "Dr. S.K. Malhotra",
      title: "Director, DKMA, ICAR",
      image: "https://icar.org.in/sites/default/files/styles/300x300/public/Dr-SK-Malhotra.jpg",
      rating: 4.7,
      reviews: 175,
      specialties: ["Agricultural Extension", "Knowledge Management"],
      email: "director.dkma@icar.gov.in",
      phone: "011-23046678",
      address: "Krishi Anusandhan Bhawan, Pusa, New Delhi – 110012",
    },
    {
      id: 3,
      name: "Dr. Shiv Kumar Agrawal",
      title: "Regional Coordinator, ICARDA",
      image: "https://www.icarda.org/sites/default/files/styles/large/public/Shiv%20Kumar.jpg",
      rating: 4.8,
      reviews: 198,
      specialties: ["Food Legumes Research", "Sustainable Agriculture"],
      email: "shiv.agrawal@icarda.org",
      phone: "+91-8375049950",
      address: "NASC Complex, Pusa, New Delhi – 110012",
    },
    {
      id: 4,
      name: "Dr. S.N. Jha",
      title: "DDG (NRM), ICAR",
      image: "https://icar.org.in/sites/default/files/Dr%20SN%20Jha.jpg",
      rating: 4.6,
      reviews: 160,
      specialties: ["Natural Resource Management", "Agricultural Engineering"],
      email: "-",
      phone: "-",
      address: "Krishi Anusandhan Bhawan-II, Pusa Campus, New Delhi – 110012",
    },
    {
      id: 5,
      name: "Dr. Anshu Bhardwaj",
      title: "Scientist, IASRI",
      image: "https://iasri.icar.gov.in/wp-content/uploads/2022/11/anshubhardwaj.jpg",
      rating: 4.5,
      reviews: 134,
      specialties: ["Agricultural Statistics", "Data Analysis"],
      email: "director@iasri.res.in",
      phone: "011-25841479",
      address: "Library Avenue, Pusa, New Delhi – 110012",
    },
    {
      id: 6,
      name: "Dr. Sanjay Kumar Singh",
      title: "Deputy Director General (Crop Science)",
      image: "https://icar.org.in/sites/default/files/sanjay-kumar-singh.jpg",
      specialties: ["Crop Science", "Agricultural Research"],
      email: "ddgcs.icar@nic.in",
      phone: "+91-11-23382545",
      address: "Division of Crop Science, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 7,
      name: "Dr. D. K. Yadava",
      title: "Assistant Director General (Seeds)",
      image: "https://icar.org.in/sites/default/files/DKYadava.jpg",
      specialties: ["Seed Technology", "Crop Improvement"],
      email: "adgseed.icar@nic.in",
      phone: "+91-11-23382257",
      address: "Room No. 101, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 8,
      name: "Dr. Sanjeev Gupta",
      title: "Assistant Director General (Oilseed and Pulses)",
      image: "https://icar.org.in/sites/default/files/sanjeev-gupta.jpg",
      specialties: ["Oilseed Crops", "Pulse Crops"],
      email: "adgop.icar@nic.in",
      phone: "+91-11-23385357",
      address: "Room No. 214, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 9,
      name: "Dr. Sharat Kumar Pradhan",
      title: "Assistant Director General (Food & Fodder Crops)",
      image: "https://icar.org.in/sites/default/files/Dr-Sharat-Pradhan.jpg",
      specialties: ["Food Crops", "Fodder Crops"],
      email: "adgffc.icar@gov.in",
      phone: "+91-11-23782600",
      address: "Room No. 212, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 10,
      name: "Dr. Poonam Jasrotia",
      title: "Assistant Director General (Plant Protection and Biosafety)",
      image: "https://icar.org.in/sites/default/files/Poonam-Jasrotia.jpg",
      specialties: ["Plant Protection", "Biosafety"],
      email: "adgpp.icar@nic.in",
      phone: "+91-11-23384414",
      address: "Room No. 215, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 11,
      name: "Dr. Ishwar Singh",
      title: "Principal Scientist (Food & Fodder Crops)",
      image: "https://icar.org.in/sites/default/files/Ishwar-Singh.jpg",
      specialties: ["Food Crops", "Fodder Crops"],
      email: "ishwar.singh@icar.gov.in",
      phone: "+91-11-23389597",
      address: "Room No. 111-A, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 12,
      name: "Dr. Sanjeev Kumar Jha",
      title: "Principal Scientist (Oilseed and Pulses)",
      image: "https://icar.org.in/sites/default/files/sanjeev-jha.jpg",
      specialties: ["Oilseed Crops", "Pulse Crops"],
      email: "sanjeev.jha@icar.gov.in",
      phone: "+91-11-23381306",
      address: "Room No. 422, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 13,
      name: "Dr. Renu",
      title: "Principal Scientist (Commercial Crops)",
      image: "https://icar.org.in/sites/default/files/Dr-Renu.jpg",
      specialties: ["Commercial Crops", "Agribusiness"],
      email: "renu1@icar.gov.in",
      phone: "+91-11-23384089",
      address: "Room No. 516-A, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 14,
      name: "Dr. Pawan Kumar Sharma",
      title: "Principal Scientist (Plant Protection and Biosafety)",
      image: "https://icar.org.in/sites/default/files/pawan-sharma.jpg",
      specialties: ["Plant Protection", "Biosafety"],
      email: "pawan.sharma@icar.org.in",
      phone: "+91-11-23385537",
      address: "Room No. 428, Krishi Bhavan, New Delhi 110001, INDIA",
    },
    {
      id: 15,
      name: "Dr. Partha Ray Choudhury",
      title: "Principal Scientist (Seeds)",
      image: "https://icar.org.in/sites/default/files/partha-ray.jpg",
      specialties: ["Seed Technology", "Genetics"],
      email: "partha.choudhary@icar.gov.in",
      phone: "+91-11-23381306",
      address: "Room No. 422, Krishi Bhavan, New Delhi 110001, INDIA",
    },
  ];
  
  return (
    <div>
      <Header />
      <Container fluid className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <Row className="text-center mb-5">
          <Col>
            <h2 className="mb-3">Connect with Agricultural Experts</h2>
            <p className="text-muted mb-4">
              Get personalized advice and solutions from our network of
              qualified agricultural professionals.
            </p>

            <Form className="d-flex justify-content-center">
              <InputGroup className="mb-3" style={{ maxWidth: "600px" }}>
                <InputGroup.Text className="bg-white border-end-0">
                  <FiSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, specialty, or expertise..."
                  aria-label="Search experts"
                  className="border-start-0"
                />
              </InputGroup>
            </Form>
          </Col>
        </Row>

        <Container>
          <Row className="mb-4 align-items-center">
            <Col>
              <h3 className="mb-0">Our Experts</h3>
            </Col>
          </Row>

          {experts.map((expert) => (
            <Card key={expert.id} className="mb-4 border-0 shadow-sm">
              <Row className="g-0">
                <Col xs={12} md={3} lg={3}>
                  <div className="position-relative h-100">
                    <Card.Img
                      src={expert.image}
                      alt={expert.name}
                      className="h-100 w-100"
                      style={{ objectFit: "cover", minHeight: "250px" }}
                    />
                  </div>
                </Col>
                <Col xs={12} md={9} lg={9}>
                  <Card.Body className="d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h4 className="mb-1">{expert.name}</h4>
                        <p className="text-muted mb-2">{expert.title}</p>
                      </div>
                      <div className="d-flex align-items-center">
                        <FiStar className="text-warning me-1" />
                        <span className="fw-bold me-1">{expert.rating}</span>
                        <span className="text-muted">({expert.reviews})</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      {expert.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          bg="light"
                          text="dark"
                          className="me-2 mb-2 py-2 px-3 rounded-pill"
                          style={{ backgroundColor: "#f0f0f0" }}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-muted">
                      <p><strong>Email:</strong> {expert.email}</p>
                      <p><strong>Phone:</strong> {expert.phone}</p>
                      <p><strong>Address:</strong> {expert.address}</p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          ))}
        </Container>
      </Container>
      <Footer />
    </div>
  );
};

export default AgriculturalExperts;