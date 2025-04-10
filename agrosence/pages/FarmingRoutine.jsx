import { Container, Row, Col } from "react-bootstrap";
import DailyRoutineSection from "../components/routine/DailyRoutine";
import SeasonalRoutineSection from "../components/routine/SeasonalRoutine";
import Layout from "../components/dashboard/Layout";
const FarmingRoutine = () => {
  return (
    <Layout>
      <Container fluid className="farming-routine-container py-5">
        <Row className="mb-5">
          <Col>
            <div className="text-center">
              <h1 className="display-4 fw-bold text-success">
                Farming Daily Routines
              </h1>
              <p className="lead">
                A comprehensive guide to optimize your agricultural activities
              </p>
            </div>
          </Col>
        </Row>

        <DailyRoutineSection />

        <Row className="my-5">
          <Col>
            <div className="divider">
              <span className="divider-text">Seasonal Planning</span>
            </div>
          </Col>
        </Row>

        <SeasonalRoutineSection />

        <Row className="my-5">
          <Col>
            <div className="divider">
              <span className="divider-text">Video Demonstrations</span>
            </div>
          </Col>
        </Row>

      </Container>
    </Layout>
  );
};

export default FarmingRoutine;
