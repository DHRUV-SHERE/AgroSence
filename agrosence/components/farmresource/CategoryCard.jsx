import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/features/resources/${category._id}`); // Navigate using `_id`
  };

  return (
    <Card 
      className="h-100 category-card bg-light border-0 shadow-sm"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="card-img-container" style={{ height: "300px", overflow: "hidden" }}>
        <Card.Img
          variant="top"
          src={category.image ? `http://localhost:5000${category.image}` : "NO image Found"}
          alt={category.name}
          className="img-fluid p-1"
          style={{
            objectPosition: "center",
            objectFit: "cover",
            height: "100%",
            width: "100%",
          }}
        />
      </div>
      <Card.Body className="text-center bg-light py-3">
        <Card.Title className="fw-bold mb-0">{category.name}</Card.Title>
      </Card.Body>
    </Card>
  );
};

export default CategoryCard;
