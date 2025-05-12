import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Card,
  Badge,
} from "react-bootstrap";
import { FiSearch, FiStar } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AgriculturalExperts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const experts = [
    {
      id: 1,
      name: "Dr. A. K. Singh",
      title: "Vice Chancellor, Bihar Agricultural University",
      rating: 4.8,
      reviews: 120,
      specialties: ["Crop Science", "Soil Health"],
      email: "vc@bau.edu.in",
      phone: "+91-612-2223962",
      address: "Sabour, Bhagalpur, Bihar – 813210",
    },
    {
      id: 2,
      name: "Dr. P. L. Gautam",
      title: "Vice Chancellor, Chhattisgarh Kamdhenu Vishwavidyalaya",
      rating: 4.7,
      reviews: 98,
      specialties: ["Animal Husbandry", "Veterinary Science"],
      email: "vc@cgkv.ac.in",
      phone: "+91-771-2253155",
      address: "Anjora, Durg, Chhattisgarh – 491001",
    },
    {
      id: 3,
      name: "Dr. S. K. Chaudhari",
      title: "Deputy Director General (NRM), ICAR",
      rating: 4.9,
      reviews: 150,
      specialties: ["Natural Resource Management", "Soil Science"],
      email: "ddgnrm.icar@nic.in",
      phone: "+91-11-23382373",
      address: "Krishi Bhavan, New Delhi – 110001",
    },
    {
      id: 4,
      name: "Dr. K. R. Kranthi",
      title: "Director, Central Institute for Cotton Research",
      rating: 4.6,
      reviews: 110,
      specialties: ["Cotton Research", "Pest Management"],
      email: "director.cicr@icar.gov.in",
      phone: "+91-712-2500245",
      address: "Nagpur, Maharashtra – 440010",
    },
    {
      id: 5,
      name: "Dr. R. S. Paroda",
      title: "Former Director General, ICAR",
      rating: 4.8,
      reviews: 200,
      specialties: ["Plant Breeding", "Genetic Resources"],
      email: "rsparoda@icar.org.in",
      phone: "+91-11-25843301",
      address: "New Delhi – 110012",
    },
    {
      id: 6,
      name: "Dr. M. C. Varshneya",
      title: "Vice Chancellor, Anand Agricultural University",
      rating: 4.7,
      reviews: 130,
      specialties: ["Dairy Science", "Animal Nutrition"],
      email: "vc@aau.in",
      phone: "+91-2692-261310",
      address: "Anand, Gujarat – 388110",
    },
    {
      id: 7,
      name: "Dr. R. K. Mittal",
      title: "Vice Chancellor, Sardar Vallabhbhai Patel University of Agriculture and Technology",
      rating: 4.5,
      reviews: 90,
      specialties: ["Agricultural Engineering", "Farm Machinery"],
      email: "vc@svpuat.edu.in",
      phone: "+91-121-2888502",
      address: "Meerut, Uttar Pradesh – 250110",
    },
    {
      id: 8,
      name: "Dr. S. Ayyappan",
      title: "Former Director General, ICAR",
      rating: 4.9,
      reviews: 210,
      specialties: ["Fisheries Science", "Aquaculture"],
      email: "sayyappan@icar.org.in",
      phone: "+91-11-25843301",
      address: "New Delhi – 110012",
    },
    {
      id: 9,
      name: "Dr. H. P. Singh",
      title: "Chairman, Coconut Development Board",
      rating: 4.6,
      reviews: 100,
      specialties: ["Horticulture", "Plantation Crops"],
      email: "chairman@coconutboard.gov.in",
      phone: "+91-484-2376265",
      address: "Kochi, Kerala – 682011",
    },
    {
      id: 10,
      name: "Dr. R. R. Hanchinal",
      title: "Chairperson, Protection of Plant Varieties and Farmers' Rights Authority",
      rating: 4.7,
      reviews: 115,
      specialties: ["Plant Variety Protection", "Seed Technology"],
      email: "chairperson@plantauthority.gov.in",
      phone: "+91-11-25848127",
      address: "New Delhi – 110012",
    },
    // Additional experts from other states and union territories can be added here
  ];
 const filteredExperts = experts.filter((expert) => {
    const query = searchQuery.toLowerCase();
    return (
      expert.name.toLowerCase().includes(query) ||
      expert.title.toLowerCase().includes(query) ||
      expert.address.toLowerCase().includes(query) ||
      expert.specialties.some((spec) =>
        spec.toLowerCase().includes(query)
      )
    );
  });

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
                  placeholder="Search by name, title, specialty, or address..."
                  aria-label="Search experts"
                  className="border-start-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

          {filteredExperts.length > 0 ? (
            filteredExperts.map((expert) => (
              <Card key={expert.id} className="mb-4 border-0 shadow-sm">
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
                    <p>
                      <strong>Email:</strong> {expert.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {expert.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {expert.address}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted">No experts found.</p>
          )}
        </Container>
      </Container>
      <Footer />
    </div>
  );
};

export default AgriculturalExperts;