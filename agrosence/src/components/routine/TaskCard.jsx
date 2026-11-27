import { Card } from "react-bootstrap"
import { FaClock, FaExclamationTriangle } from "react-icons/fa"

const TaskCard = ({ task }) => {
  const getImportanceColor = (importance) => {
    switch (importance) {
      case "Critical":
        return "danger"
      case "High":
        return "warning"
      default:
        return "info"
    }
  }

  return (
    <Card className="h-100 shadow-sm border-success">
      <Card.Header className="text-white d-flex align-items-center" style={{ backgroundColor: "#34a853" }}>
        <div className="me-2">{task.icon}</div>
        <h4 className="mb-0">{task.title}</h4>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <FaClock className="text-muted me-2" />
          <span className="fw-bold">{task.time}</span>
        </div>

        <Card.Text>{task.description}</Card.Text>

        <div className={`mt-3 text-${getImportanceColor(task.importance)} d-flex align-items-center`}>
          <FaExclamationTriangle className="me-2" />
          <span className="fw-bold">Importance: {task.importance}</span>
        </div>
      </Card.Body>
    </Card>
  )
}

export default TaskCard

