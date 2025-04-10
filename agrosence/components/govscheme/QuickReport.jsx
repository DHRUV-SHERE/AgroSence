import { Card } from "react-bootstrap";
import { FaBell, FaNewspaper } from "react-icons/fa";
import { motion } from "framer-motion";

const QuickReports = () => {
  const news = [
    { id: 1, title: "New Agricultural Scheme Launched", date: "2024-02-01" },
    { id: 2, title: "Farmer Support Program Update", date: "2024-01-30" },
    { id: 3, title: "Crop Insurance Deadline Extended", date: "2024-01-28" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="quick-reports shadow-lg">
        <Card.Header className="bg-primary text-white d-flex align-items-center">
          <FaNewspaper className="me-2" />
          <h5 className="mb-0">Quick Reports</h5>
        </Card.Header>
        <Card.Body>
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="news-item mb-3 p-2 border-bottom"
            >
              <div className="d-flex align-items-start">
                <FaBell className="me-2 mt-1 text-warning" />
                <div>
                  <h6 className="mb-1">{item.title}</h6>
                  <small className="text-muted">{item.date}</small>
                </div>
              </div>
            </motion.div>
          ))}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default QuickReports;
