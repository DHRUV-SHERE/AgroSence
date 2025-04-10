import { Row, Col, Card, ListGroup, Badge } from "react-bootstrap"
import { FaSun, FaCloudSun, FaSeedling, FaWater, FaLeaf, FaClipboardCheck, FaTools } from "react-icons/fa"
import { BsFillSunriseFill, BsSunsetFill } from "react-icons/bs"
import TaskCard from "./TaskCard"

const DailyRoutineSection = () => {
  const dailyTasks = [
    {
      id: 1,
      time: "5:00 AM - 6:00 AM",
      title: "Early Morning Inspection",
      description: "Check for any overnight damage, pest issues, or irrigation problems.",
      icon: <BsFillSunriseFill className="task-icon" />,
      importance: "High",
    },
    {
      id: 2,
      time: "6:00 AM - 8:00 AM",
      title: "Watering",
      description:
        "Early morning watering reduces evaporation and helps plants absorb water efficiently before the day heats up.",
      icon: <FaWater className="task-icon" />,
      importance: "Critical",
    },
    {
      id: 3,
      time: "8:00 AM - 10:00 AM",
      title: "Harvesting",
      description: "Harvest ripe produce during cooler morning hours to ensure freshness and quality.",
      icon: <FaLeaf className="task-icon" />,
      importance: "Medium",
    },
    {
      id: 4,
      time: "10:00 AM - 12:00 PM",
      title: "Maintenance & Repairs",
      description: "Perform equipment maintenance, fence repairs, and structural upkeep.",
      icon: <FaTools className="task-icon" />,
      importance: "Medium",
    },
    {
      id: 5,
      time: "3:00 PM - 5:00 PM",
      title: "Fertilization",
      description: "Apply fertilizers in the late afternoon when temperatures begin to cool down.",
      icon: <FaSeedling className="task-icon" />,
      importance: "High",
    },
    {
      id: 6,
      time: "5:00 PM - 6:00 PM",
      title: "Evening Watering",
      description: "Second watering session if needed, especially during hot summer days.",
      icon: <FaWater className="task-icon" />,
      importance: "Medium",
    },
    {
      id: 7,
      time: "6:00 PM - 7:00 PM",
      title: "Final Inspection",
      description: "End-of-day inspection to ensure everything is in order before nightfall.",
      icon: <BsSunsetFill className="task-icon" />,
      importance: "High",
    },
  ]

  return (
    <>
      <Row>
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-success">
            <Card.Header className="text-white" style={{ backgroundColor: "#34a853" }}>
              <h3 className="mb-0">
                <FaCloudSun className="me-2" />
                Morning Routine
              </h3>
            </Card.Header>
            <ListGroup variant="flush">
              {dailyTasks.slice(0, 3).map((task) => (
                <ListGroup.Item key={task.id} className="d-flex align-items-center">
                  <div className="me-3 text-success">{task.icon}</div>
                  <div>
                    <div className="fw-bold">{task.time}</div>
                    <div>{task.title}</div>
                    <Badge
                      bg={task.importance === "Critical" ? "danger" : task.importance === "High" ? "warning" : "info"}
                      className="mt-1"
                    >
                      {task.importance}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-success">
            <Card.Header className="text-white" style={{ backgroundColor: "#34a853" }}>
              <h3 className="mb-0">
                <FaSun className="me-2" />
                Midday Routine
              </h3>
            </Card.Header>
            <ListGroup variant="flush">
              {dailyTasks.slice(3, 5).map((task) => (
                <ListGroup.Item key={task.id} className="d-flex align-items-center">
                  <div className="me-3 text-success">{task.icon}</div>
                  <div>
                    <div className="fw-bold">{task.time}</div>
                    <div>{task.title}</div>
                    <Badge
                      bg={task.importance === "Critical" ? "danger" : task.importance === "High" ? "warning" : "info"}
                      className="mt-1"
                    >
                      {task.importance}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-success">
            <Card.Header className="text-white" style={{ backgroundColor: "#34a853" }}>
              <h3 className="mb-0">
                <BsSunsetFill className="me-2" />
                Evening Routine
              </h3>
            </Card.Header>
            <ListGroup variant="flush">
              {dailyTasks.slice(5, 7).map((task) => (
                <ListGroup.Item key={task.id} className="d-flex align-items-center">
                  <div className="me-3 text-success">{task.icon}</div>
                  <div>
                    <div className="fw-bold">{task.time}</div>
                    <div>{task.title}</div>
                    <Badge
                      bg={task.importance === "Critical" ? "danger" : task.importance === "High" ? "warning" : "info"}
                      className="mt-1"
                    >
                      {task.importance}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h2 className="text-success mb-4">
            <FaClipboardCheck className="me-2" />
            Detailed Daily Tasks
          </h2>
        </Col>
      </Row>

      <Row>
        {dailyTasks.map((task) => (
          <Col lg={6} className="mb-4" key={task.id}>
            <TaskCard task={task} />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default DailyRoutineSection

