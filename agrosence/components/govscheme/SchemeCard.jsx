import React from "react";
import { Card } from "react-bootstrap";
import { FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const SchemeCard = ({ state, imageUrl, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        console.log("Card clicked:", state);
        if (onClick) onClick();
      }}
      className="scheme-card-container"
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    >
      <Card
        className="scheme-card mb-3 border border-black position-relative overflow-hidden bg-light"
        style={{ minHeight: "200px" }}
      >
        <div
          className="card-background"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundBlendMode: "lighten",
            backgroundPosition: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
          }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
        ></div>
        <Card.Body
          className="d-flex flex-column justify-content-center align-items-center"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            console.log("Card body clicked:", state);
            if (onClick) onClick();
          }}
        >
          <FaMapMarkerAlt className="mb-2" size={30} />
          <Card.Title className="text-center fs-3 fw-bold">{state}</Card.Title>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default SchemeCard;
