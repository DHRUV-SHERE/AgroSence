"use client";
import { useState, useEffect, useRef } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { FaQuoteRight, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([
    { name: "Jeet Jani", date: "12/12/2021", rating: 5, title: "Useful Products", comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { name: "Dhruv Shere", date: "01/05/2023", rating: 5, title: "Excellent Service", comment: "Gravida molestie turpis et tortor odio cursus odio sem." },
    { name: "Herin Patel", date: "03/10/2022", rating: 5, title: "Very good service", comment: "Fusce sed adipiscing neque! Orci varius natoque penatibus et tortor dolor." },
  ]);

  const [newComment, setNewComment] = useState({
    name: "",
    rating: 5,
    title: "",
    comment: "",
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollRight();
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials]);

  const handleChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.name || !newComment.comment || !newComment.title) return;
    const date = new Date().toLocaleDateString();
    setTestimonials([...testimonials, { ...newComment, date }]);
    setNewComment({ name: "", rating: 5, title: "", comment: "" });
  };

  const renderStars = (count) => {
    return [...Array(count)].map((_, i) => <FaStar key={i} className="text-warning" />);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      const firstItem = testimonials[0];
      setTestimonials([...testimonials.slice(1), firstItem]); // Move first item to last
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const lastItem = testimonials[testimonials.length - 1];
      setTestimonials([lastItem, ...testimonials.slice(0, testimonials.length - 1)]); // Move last item to first
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold text-success mb-4">Our Happy Clients</h2>

      {/* Scrollable Testimonials */}
      <div className="d-flex align-items-center mb-5">
        <Button variant="light" className="me-2" onClick={scrollLeft}>
          <FaChevronLeft size={24} className="text-success" />
        </Button>

        <div className="overflow-hidden w-100 position-relative">
          <div
            ref={scrollRef}
            className="d-flex scroll-container"
            style={{
              overflowX: "hidden",
              scrollBehavior: "smooth",
              whiteSpace: "nowrap",
              display: "flex",
            }}
          >
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="shadow-sm border-0 mx-3 flex-shrink-0" style={{ minWidth: "200px" }}>
                <Card.Body className="text-center">
                  <FaQuoteRight className="text-success opacity-25 position-absolute top-0 end-0 m-2" size={24} />
                  <h5 className="fw-bold">{testimonial.name}</h5>
                  <p className="small text-muted">Verified {testimonial.date}</p>
                  <div className="d-flex justify-content-center mb-2">{renderStars(testimonial.rating)}</div>
                  <h6 className="fw-bold">{testimonial.title}</h6>
                  <p className="small text-muted">{testimonial.comment}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>

        <Button variant="light" className="ms-2" onClick={scrollRight}>
          <FaChevronRight size={24} className="text-success" />
        </Button>
      </div>

      {/* Comment Form with More Space */}
      <Form onSubmit={handleSubmit} className="mb-5 p-4 shadow-sm border rounded bg-light">
        <h4 className="mb-3">Leave a Review</h4>
        <Form.Group className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" value={newComment.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" name="title" value={newComment.title} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Comment</Form.Label>
          <Form.Control as="textarea" name="comment" rows={3} value={newComment.comment} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit" variant="success">Submit Review</Button>
      </Form>
    </Container>
  );
};

export default TestimonialsSection;
