import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import CategoryCard from "./CategoryCard";

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/resources/all")  // Fixed extra "/"
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch resources");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {  // Ensure data structure is correct
          setCategories(data.data);
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch((err) => console.error("Error fetching resources:", err));
  }, []);

  return (
    <Row className="g-4">
      {categories.length > 0 ? (
        categories.map((category) => (
          <Col key={category._id} xs={12} sm={6} md={4} lg={4} xl={4}>
            <CategoryCard category={category} />
          </Col>
        ))
      ) : (
        <p>No categories found.</p>
      )}
    </Row>
  );
};

export default CategoryGrid;
