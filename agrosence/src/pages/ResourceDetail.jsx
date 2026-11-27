import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import Resource2Header from "../components/farmresource2/Resource2Header";
import ResourceDetail from "../components/farmresource2/Resource2Details";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TestimonialsSection from "../components/farmresource2/Testomonials";

const ResourceDetailPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Resource2Header />
      <Container className="py-4">
        <Button variant="success" onClick={() => navigate(-1)} className="mb-4">
          Back to Resource
        </Button>
        <ResourceDetail />
        <TestimonialsSection />
      </Container>
      <Footer />
    </>
  );
};

export default ResourceDetailPage;
