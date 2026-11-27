"use client"

import { useState } from "react"
import { Row, Col, Card, Nav } from "react-bootstrap"
import {
  FaSun,
  FaSnowflake,
  FaLeaf,
  FaCanadianMapleLeaf,
  FaSeedling,
  FaWater,
  FaTemperatureHigh,
  FaTemperatureLow,
  FaBug,
  FaWind,
  FaShieldAlt,
} from "react-icons/fa"

const SeasonalRoutineSection = () => {
  const [activeTab, setActiveTab] = useState("spring")

  const seasonalTasks = {
    spring: [
      {
        id: 1,
        title: "Soil Preparation",
        description: "Test soil pH, add amendments, and prepare beds for planting.",
        icon: <FaSeedling />,
        timing: "Early Spring (March-April)",
      },
      {
        id: 2,
        title: "Planting",
        description: "Plant cool-season crops and start seedlings for summer crops.",
        icon: <FaLeaf />,
        timing: "Mid Spring (April-May)",
      },
      {
        id: 3,
        title: "Irrigation Setup",
        description: "Install or repair irrigation systems before the growing season.",
        icon: <FaWater />,
        timing: "Early to Mid Spring",
      },
      {
        id: 4,
        title: "Pest Prevention",
        description: "Apply preventative measures for common spring pests.",
        icon: <FaBug />,
        timing: "Throughout Spring",
      },
    ],
    summer: [
      {
        id: 1,
        title: "Irrigation Management",
        description: "Increase watering frequency during hot periods, preferably early morning and evening.",
        icon: <FaWater />,
        timing: "Daily, Early Morning and Evening",
      },
      {
        id: 2,
        title: "Heat Protection",
        description: "Provide shade for sensitive crops and monitor for heat stress.",
        icon: <FaTemperatureHigh />,
        timing: "During Peak Heat (11AM-3PM)",
      },
      {
        id: 3,
        title: "Pest Control",
        description: "Regular monitoring and management of summer pests and diseases.",
        icon: <FaShieldAlt />,
        timing: "Weekly",
      },
      {
        id: 4,
        title: "Harvesting",
        description: "Regular harvesting of summer crops at peak ripeness.",
        icon: <FaLeaf />,
        timing: "Early Morning",
      },
    ],
    fall: [
      {
        id: 1,
        title: "Fall Planting",
        description: "Plant cool-season crops and cover crops for winter.",
        icon: <FaSeedling />,
        timing: "Early to Mid Fall",
      },
      {
        id: 2,
        title: "Soil Enrichment",
        description: "Add compost and amendments to replenish soil nutrients.",
        icon: <FaLeaf />,
        timing: "Throughout Fall",
      },
      {
        id: 3,
        title: "Winterization",
        description: "Prepare irrigation systems and equipment for winter.",
        icon: <FaSnowflake />,
        timing: "Late Fall",
      },
      {
        id: 4,
        title: "Final Harvests",
        description: "Complete harvesting of remaining summer crops before frost.",
        icon: <FaCanadianMapleLeaf />,
        timing: "Before First Frost",
      },
    ],
    winter: [
      {
        id: 1,
        title: "Equipment Maintenance",
        description: "Repair and maintain farm equipment during the off-season.",
        icon: <FaWind />,
        timing: "Throughout Winter",
      },
      {
        id: 2,
        title: "Greenhouse Management",
        description: "Maintain temperature and humidity in greenhouses for winter crops.",
        icon: <FaTemperatureLow />,
        timing: "Daily",
      },
      {
        id: 3,
        title: "Planning",
        description: "Plan crop rotations and order seeds for the upcoming season.",
        icon: <FaSeedling />,
        timing: "January-February",
      },
      {
        id: 4,
        title: "Frost Protection",
        description: "Protect perennial plants and winter crops from extreme cold.",
        icon: <FaSnowflake />,
        timing: "During Frost Events",
      },
    ],
  }

  const seasonIcons = {
    spring: <FaLeaf className="me-2 text-success" />,
    summer: <FaSun className="me-2 text-warning" />,
    fall: <FaCanadianMapleLeaf className="me-2 text-danger" />,
    winter: <FaSnowflake className="me-2 text-primary" />,
  }

  const seasonColors = {
    spring: "success",
    summer: "warning",
    fall: "danger",
    winter: "primary",
  }

  const renderTabContent = () => {
    const tasks = seasonalTasks[activeTab]
    const color = seasonColors[activeTab]

    return (
      <Row>
        {tasks.map((task) => (
          <Col md={6} key={task.id} className="mb-3">
            <Card className={`h-100 border-${color}`}>
              <Card.Header className={`bg-${color} bg-opacity-75 ${color === "warning" ? "text-dark" : "text-white"}`}>
                <h5 className="mb-0 d-flex align-items-center">
                  {task.icon} <span className="ms-2">{task.title}</span>
                </h5>
              </Card.Header>
              <Card.Body>
                <Card.Text>{task.description}</Card.Text>
                <div className="text-muted">
                  <strong>When:</strong> {task.timing}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  return (
    <Row>
      <Col>
        <Card className="shadow-sm">
          <Card.Header className="text-white" style={{ backgroundColor: "#34a853" }}>
            <h2 className="mb-0">Seasonal Farming Routines</h2>
          </Card.Header>
          <Card.Body>
            <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="spring">{seasonIcons.spring} Spring</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="summer">{seasonIcons.summer} Summer</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fall">{seasonIcons.fall} Fall</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="winter">{seasonIcons.winter} Winter</Nav.Link>
              </Nav.Item>
            </Nav>

            {renderTabContent()}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default SeasonalRoutineSection

