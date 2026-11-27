import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroBanner from "../components/farmresource/ResourceHeader";
import CategoryGrid from "../components/farmresource/CategoryGrid";

const ResourcesPage = () => {
  const navigate = useNavigate();
  return (
    <div className="resources-page">
      <Header />
      <HeroBanner />
      <Container className="py-5">
        <div className="text-center mb-5" style={{ color: "#C4C4C4" }}>
          <h2 className="mb-3">We Promise To Find You The Right Equipment</h2>
          <h1 className="display-4 fw-bold">Browse Machinery Categories</h1>
        </div>
        <div className="backbtn w-100 d-flex justify-content-start align-items-center">
        <Button variant="primary" onClick={() => navigate(-1)} className="mb-4">
          Back to Features
        </Button>
      </div>
        <CategoryGrid />
      </Container>
      <Footer />
    </div>
  );
};

export default ResourcesPage;
